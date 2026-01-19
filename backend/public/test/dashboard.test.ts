import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, getAuthToken, setupTestDB, teardownTestDB } from './helpers';

const app = createTestApp();

describe('Dashboard API', () => {
  let authToken: string;

  beforeAll(async () => {
    await setupTestDB();
    authToken = await getAuthToken(app, '7777777777', 'test123');
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('GET /api/dashboard/stats', () => {
    it('should get dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total_products');
      expect(response.body).toHaveProperty('total_purchases');
      expect(response.body).toHaveProperty('total_sales');
      expect(response.body).toHaveProperty('profit');
      expect(typeof response.body.total_products).toBe('number');
      expect(typeof response.body.total_purchases).toBe('number');
      expect(typeof response.body.total_sales).toBe('number');
      expect(typeof response.body.profit).toBe('number');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats');

      expect(response.status).toBe(401);
    });

    it('should calculate profit correctly', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${authToken}`);

      const expectedProfit = response.body.total_sales - response.body.total_purchases;
      expect(response.body.profit).toBe(expectedProfit);
    });
  });
});

