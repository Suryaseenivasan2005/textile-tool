import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, getAuthToken, setupTestDB, teardownTestDB } from './helpers';

const app = createTestApp();

describe('Colors API', () => {
  let authToken: string;

  beforeAll(async () => {
    await setupTestDB();
    authToken = await getAuthToken(app, '1010101010', 'test123');
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('GET /api/colors', () => {
    it('should get all colors', async () => {
      const response = await request(app)
        .get('/api/colors')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/colors', () => {
    it('should create a new color', async () => {
      const response = await request(app)
        .post('/api/colors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Color',
          hex_code: 'FF5733',
          status: 'active',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Color');
      expect(response.body.hex_code).toBe('FF5733');
    });

    it('should reject color without name', async () => {
      const response = await request(app)
        .post('/api/colors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hex_code: 'FF5733',
        });

      expect([400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject invalid hex code format', async () => {
      const response = await request(app)
        .post('/api/colors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Color',
          hex_code: 'INVALID',
        });

      expect([400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/colors/:id', () => {
    let colorId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/colors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Update Color Test',
          status: 'active',
        });
      colorId = response.body.id;
    });

    it('should update a color', async () => {
      const response = await request(app)
        .put(`/api/colors/${colorId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Color Name',
          hex_code: '00FF00',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Color Name');
      expect(response.body.hex_code).toBe('00FF00');
    });
  });
});

