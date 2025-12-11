import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, getAuthToken, setupTestDB, teardownTestDB } from './helpers';

const app = createTestApp();

describe('Categories API', () => {
  let authToken: string;

  beforeAll(async () => {
    await setupTestDB();
    authToken = await getAuthToken(app, '9999999999', 'test123');
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('GET /api/categories', () => {
    it('should get all categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/categories?status=active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      if (response.body.length > 0) {
        expect(response.body[0].status).toBe('active');
      }
    });
  });

  describe('POST /api/categories', () => {
    it('should create a new category', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Category',
          description: 'Test Description',
          status: 'active',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Category');
    });

    it('should reject category without name', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test Description',
        });

      expect([400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/categories/:id', () => {
    let categoryId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Update Category Test',
          status: 'active',
        });
      categoryId = response.body.id;
    });

    it('should update a category', async () => {
      const response = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Category Name',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Category Name');
    });
  });

  describe('DELETE /api/categories/:id', () => {
    let categoryId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Delete Category Test',
          status: 'active',
        });
      categoryId = response.body.id;
    });

    it('should deactivate a category', async () => {
      const response = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });
});

