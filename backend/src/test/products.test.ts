import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, getAuthToken, setupTestDB, teardownTestDB } from './helpers';

const app = createTestApp();

describe('Products API', () => {
  let authToken: string;
  let categoryId: string;
  let colorId: string;

  beforeAll(async () => {
    await setupTestDB();
    authToken = await getAuthToken(app, '3333333333', 'test123');

    // Create category and color for product tests
    const categoryResponse = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test Category', status: 'active' });
    categoryId = categoryResponse.body.id;

    const colorResponse = await request(app)
      .post('/api/colors')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test Color', status: 'active' });
    colorId = colorResponse.body.id;
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/products?status=active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      if (response.body.length > 0) {
        expect(response.body[0].status).toBe('active');
      }
    });

    it('should search products', async () => {
      const response = await request(app)
        .get('/api/products?search=test')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'Test Product',
        category: categoryId,
        color: colorId,
        unit: 'meter',
        cost_price: 100,
        selling_price: 150,
        status: 'active',
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(productData.name);
      expect(response.body.cost_price).toBe(productData.cost_price);
    });

    it('should reject product without name', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          unit: 'meter',
          cost_price: 100,
        });

      expect([400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject product with negative price', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          unit: 'meter',
          cost_price: -100,
          selling_price: 150,
        });

      expect([400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });

    it('should initialize inventory for new product', async () => {
      const productResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Inventory Test Product',
          unit: 'meter',
          cost_price: 100,
          selling_price: 150,
        });

      const productId = productResponse.body.id;

      // Check inventory was created
      const inventoryResponse = await request(app)
        .get(`/api/inventory?product_id=${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(inventoryResponse.status).toBe(200);
      expect(inventoryResponse.body.length).toBeGreaterThan(0);
      expect(inventoryResponse.body[0].product_id).toBe(productId);
    });
  });

  describe('GET /api/products/:id', () => {
    let productId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Get Product Test',
          unit: 'meter',
          cost_price: 100,
          selling_price: 150,
        });
      productId = response.body.id;
    });

    it('should get a product by id', async () => {
      const response = await request(app)
        .get(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(productId);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/products/:id', () => {
    let productId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Update Product Test',
          unit: 'meter',
          cost_price: 100,
          selling_price: 150,
        });
      productId = response.body.id;
    });

    it('should update a product', async () => {
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Product Name',
          selling_price: 200,
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Product Name');
      expect(response.body.selling_price).toBe(200);
    });
  });

  describe('DELETE /api/products/:id', () => {
    let productId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Delete Product Test',
          unit: 'meter',
          cost_price: 100,
          selling_price: 150,
        });
      productId = response.body.id;
    });

    it('should deactivate a product (soft delete)', async () => {
      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verify product is deactivated
      const getResponse = await request(app)
        .get(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.body.status).toBe('inactive');
    });
  });
});

