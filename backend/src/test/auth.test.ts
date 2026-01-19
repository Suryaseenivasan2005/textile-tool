import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import authRoutes from '../routes/authRoutes';
import { errorHandler } from '../middleware/errorHandler';
import { connectDB, closeDB } from '../config/database';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use(errorHandler);

describe('Auth API', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      // Use a unique mobile number with timestamp
      const uniqueMobile = `111111${Date.now().toString().slice(-4)}`;
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          mobile: uniqueMobile,
          password: 'test123',
          name: 'Test User',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.mobile).toBe(uniqueMobile);
    });

    it('should reject invalid mobile number', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          mobile: '123',
          password: 'test123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          mobile: '2222222222',
          password: '123',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // First register a user
      await request(app)
        .post('/api/auth/register')
        .send({
          mobile: '3333333333',
          password: 'test123',
        });

      // Then login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          mobile: '3333333333',
          password: 'test123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          mobile: '9999999999',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});
