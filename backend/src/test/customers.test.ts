import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, getAuthToken, setupTestDB, teardownTestDB } from './helpers';

const app = createTestApp();

describe('Customers API', () => {
  let authToken: string;

  beforeAll(async () => {
    await setupTestDB();
    authToken = await getAuthToken(app, '2222222222', 'test123');
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('GET /api/customers', () => {
    it('should get all customers', async () => {
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/customers');

      expect(response.status).toBe(401);
    });

    it('should search customers', async () => {
      const response = await request(app)
        .get('/api/customers?search=test')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      const customerData = {
        name: 'Test Customer',
        gst_number: '29ABCDE1234F1Z5',
        phone: '9876543210',
        address: 'Test Address',
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(customerData.name);
    });

    it('should reject customer without name', async () => {
      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phone: '9876543210',
        });

      expect([400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/customers/:id', () => {
    let customerId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Get Customer Test',
        });
      customerId = response.body.id;
    });

    it('should get a customer by id', async () => {
      const response = await request(app)
        .get(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(customerId);
    });

    it('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .get('/api/customers/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/customers/:id', () => {
    let customerId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Update Customer Test',
        });
      customerId = response.body.id;
    });

    it('should update a customer', async () => {
      const response = await request(app)
        .put(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Customer Name',
          phone: '9999999999',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Customer Name');
    });
  });

  describe('DELETE /api/customers/:id', () => {
    let customerId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Delete Customer Test',
        });
      customerId = response.body.id;
    });

    it('should delete a customer', async () => {
      const response = await request(app)
        .delete(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verify customer is deleted
      const getResponse = await request(app)
        .get(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });
});

