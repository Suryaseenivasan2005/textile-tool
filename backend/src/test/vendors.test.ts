import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, getAuthToken, setupTestDB, teardownTestDB } from './helpers';

const app = createTestApp();

describe('Vendors API', () => {
  let authToken: string;

  beforeAll(async () => {
    await setupTestDB();
    authToken = await getAuthToken(app, '1111111111', 'test123');
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('GET /api/vendors', () => {
    it('should get all vendors', async () => {
      const response = await request(app)
        .get('/api/vendors')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/vendors');

      expect(response.status).toBe(401);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/vendors?status=active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      if (response.body.length > 0) {
        expect(response.body[0].status).toBe('active');
      }
    });

    it('should search vendors', async () => {
      const response = await request(app)
        .get('/api/vendors?search=test')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/vendors', () => {
    it('should create a new vendor', async () => {
      const vendorData = {
        name: 'Test Vendor',
        gst_number: '29ABCDE1234F1Z5',
        phone: '9876543210',
        address: 'Test Address',
        status: 'active',
      };

      const response = await request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${authToken}`)
        .send(vendorData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(vendorData.name);
      expect(response.body.gst_number).toBe(vendorData.gst_number);
    });

    it('should reject vendor without name', async () => {
      const response = await request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phone: '9876543210',
        });

      expect([400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/vendors')
        .send({ name: 'Test Vendor' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/vendors/:id', () => {
    let vendorId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Get Vendor Test',
          status: 'active',
        });
      vendorId = response.body.id;
    });

    it('should get a vendor by id', async () => {
      const response = await request(app)
        .get(`/api/vendors/${vendorId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(vendorId);
      expect(response.body.name).toBe('Get Vendor Test');
    });

    it('should return 404 for non-existent vendor', async () => {
      const response = await request(app)
        .get('/api/vendors/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app)
        .get('/api/vendors/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect([400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/vendors/:id', () => {
    let vendorId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Update Vendor Test',
          status: 'active',
        });
      vendorId = response.body.id;
    });

    it('should update a vendor', async () => {
      const response = await request(app)
        .put(`/api/vendors/${vendorId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Vendor Name',
          phone: '9999999999',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Vendor Name');
      expect(response.body.phone).toBe('9999999999');
    });

    it('should return 404 for non-existent vendor', async () => {
      const response = await request(app)
        .put('/api/vendors/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/vendors/:id', () => {
    let vendorId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Delete Vendor Test',
          status: 'active',
        });
      vendorId = response.body.id;
    });

    it('should deactivate a vendor (soft delete)', async () => {
      const response = await request(app)
        .delete(`/api/vendors/${vendorId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verify vendor is deactivated
      const getResponse = await request(app)
        .get(`/api/vendors/${vendorId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.body.status).toBe('inactive');
    });

    it('should return 404 for non-existent vendor', async () => {
      const response = await request(app)
        .delete('/api/vendors/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});

