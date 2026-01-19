import request from 'supertest';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/database';
import authRoutes from '../routes/authRoutes';
import vendorRoutes from '../routes/vendorRoutes';
import customerRoutes from '../routes/customerRoutes';
import productRoutes from '../routes/productRoutes';
import categoryRoutes from '../routes/categoryRoutes';
import colorRoutes from '../routes/colorRoutes';
import purchaseRoutes from '../routes/purchaseRoutes';
import saleRoutes from '../routes/saleRoutes';
import returnRoutes from '../routes/returnRoutes';
import inventoryRoutes from '../routes/inventoryRoutes';
import paymentRoutes from '../routes/paymentRoutes';
import dashboardRoutes from '../routes/dashboardRoutes';
import settingsRoutes from '../routes/settingsRoutes';
import { errorHandler } from '../middleware/errorHandler';

dotenv.config();

export const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api/vendors', vendorRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/colors', colorRoutes);
  app.use('/api/purchases', purchaseRoutes);
  app.use('/api/sales', saleRoutes);
  app.use('/api/returns', returnRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/settings', settingsRoutes);

  app.use(errorHandler);
  return app;
};

export const getAuthToken = async (app: express.Application, mobile: string = '9999999999', password: string = 'test123') => {
  // Try to register first
  await request(app)
    .post('/api/auth/register')
    .send({ mobile, password, name: 'Test User' })
    .catch(() => {}); // Ignore if user already exists

  // Login
  const response = await request(app)
    .post('/api/auth/login')
    .send({ mobile, password });

  return response.body.token;
};

export const setupTestDB = async () => {
  await connectDB();
};

export const teardownTestDB = async () => {
  await closeDB();
};

