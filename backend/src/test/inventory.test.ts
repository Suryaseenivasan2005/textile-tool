import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, getAuthToken, setupTestDB, teardownTestDB } from './helpers';

const app = createTestApp();

describe('Inventory API', () => {
  let authToken: string;
  let productId: string;

  beforeAll(async () => {
    await setupTestDB();
    authToken = await getAuthToken(app, '6666666666', 'test123');

    // Create product for inventory tests
    const productResponse = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Inventory Test Product',
        unit: 'meter',
        cost_price: 100,
        selling_price: 150,
      });
    productId = productResponse.body.id;
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('GET /api/inventory', () => {
    it('should get all inventory', async () => {
      const response = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by product_id', async () => {
      const response = await request(app)
        .get(`/api/inventory?product_id=${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0].product_id).toBe(productId);
      }
    });
  });

  describe('POST /api/inventory/adjust', () => {
    it('should add stock (type: in)', async () => {
      // Get initial quantity
      const initialResponse = await request(app)
        .get(`/api/inventory?product_id=${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const initialQty = initialResponse.body[0]?.quantity_available || 0;

      // Add stock
      const response = await request(app)
        .post('/api/inventory/adjust')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: productId,
          quantity: 10,
          type: 'in',
          reason: 'Test stock addition',
        });

      expect(response.status).toBe(200);
      expect(response.body.new_quantity).toBe(initialQty + 10);
      expect(response.body.adjustment).toBe(10);
    });

    it('should remove stock (type: out)', async () => {
      // Get current quantity
      const currentResponse = await request(app)
        .get(`/api/inventory?product_id=${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const currentQty = currentResponse.body[0]?.quantity_available || 0;

      if (currentQty >= 5) {
        // Remove stock
        const response = await request(app)
          .post('/api/inventory/adjust')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            product_id: productId,
            quantity: 5,
            type: 'out',
            reason: 'Test stock removal',
          });

        expect(response.status).toBe(200);
        expect(response.body.new_quantity).toBe(currentQty - 5);
      }
    });

    it('should reject stock out with insufficient inventory', async () => {
      // Get current quantity
      const currentResponse = await request(app)
        .get(`/api/inventory?product_id=${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const currentQty = currentResponse.body[0]?.quantity_available || 0;

      // Try to remove more than available
      const response = await request(app)
        .post('/api/inventory/adjust')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: productId,
          quantity: currentQty + 100,
          type: 'out',
        });

      expect(response.status).toBe(400);
    });

    it('should set stock to exact value (type: adjustment)', async () => {
      const response = await request(app)
        .post('/api/inventory/adjust')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: productId,
          quantity: 50,
          type: 'adjustment',
          reason: 'Manual stock correction',
        });

      expect(response.status).toBe(200);
      expect(response.body.new_quantity).toBe(50);

      // Verify
      const verifyResponse = await request(app)
        .get(`/api/inventory?product_id=${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(verifyResponse.body[0].quantity_available).toBe(50);
    });

    it('should reject invalid adjustment type', async () => {
      const response = await request(app)
        .post('/api/inventory/adjust')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: productId,
          quantity: 10,
          type: 'invalid',
        });

      expect(response.status).toBe(400);
    });

    it('should reject adjustment with invalid product', async () => {
      const response = await request(app)
        .post('/api/inventory/adjust')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: '507f1f77bcf86cd799439011',
          quantity: 10,
          type: 'in',
        });

      expect(response.status).toBe(404);
    });
  });
});

