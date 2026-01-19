import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, getAuthToken, setupTestDB, teardownTestDB } from './helpers';

const app = createTestApp();

describe('Settings API', () => {
  let authToken: string;

  beforeAll(async () => {
    await setupTestDB();
    authToken = await getAuthToken(app, '8888888888', 'test123');
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('GET /api/settings', () => {
    it('should get settings', async () => {
      const response = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('business_name');
      expect(response.body).toHaveProperty('tax_rate');
      expect(response.body).toHaveProperty('invoice_prefix');
    });

    it('should return default settings if none exist', async () => {
      const response = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.tax_rate).toBe(18);
      expect(response.body.invoice_prefix).toBe('INV');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/settings');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/settings', () => {
    it('should update settings', async () => {
      const settingsData = {
        business_name: 'Test Business',
        business_address: '123 Test Street',
        business_phone: '9876543210',
        business_email: 'test@example.com',
        gst_number: '29ABCDE1234F1Z5',
        tax_rate: 18,
        invoice_prefix: 'INV',
      };

      const response = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(settingsData);

      expect(response.status).toBe(200);
      expect(response.body.business_name).toBe(settingsData.business_name);
      expect(response.body.business_address).toBe(settingsData.business_address);
      expect(response.body.tax_rate).toBe(settingsData.tax_rate);
    });

    it('should allow partial updates', async () => {
      const response = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          business_name: 'Updated Business Name',
        });

      expect(response.status).toBe(200);
      expect(response.body.business_name).toBe('Updated Business Name');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/settings')
        .send({ business_name: 'Test' });

      expect(response.status).toBe(401);
    });
  });
});

