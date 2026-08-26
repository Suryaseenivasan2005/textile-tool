import { Request, Response } from 'express';
import { getDB } from '../config/database';
import { DB_CONFIG, DEMO_USER_ID } from '../constants';
import { asyncHandler } from '../middleware/asyncHandler';
import { generateToken } from '../utils/jwt';

const clearDemoData = async () => {
  const db = getDB();
  const collections = Object.values(DB_CONFIG.COLLECTIONS);

  // Clear existing demo data in all collections
  for (const collectionName of collections) {
    if (collectionName !== DB_CONFIG.COLLECTIONS.USERS) {
      await db.collection(collectionName).deleteMany({ is_demo: true });
    }
  }
};

const seedDemoData = async () => {
  const db = getDB();
  const now = new Date();

  // 1. Vendors
  const vendors = [
    { name: 'Textile Mills Ltd', gst_number: '27AABCU9603R1ZJ', phone: '9876543210', address: 'Mumbai, MH', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Silk Route Fabrics', gst_number: '29BBDCU9603R1ZK', phone: '9876543211', address: 'Bangalore, KA', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Cotton King', gst_number: '33CCDCU9603R1ZL', phone: '9876543212', address: 'Coimbatore, TN', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Polyester Palace', gst_number: '24DDDCU9603R1ZM', phone: '9876543213', address: 'Surat, GJ', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
  ];
  const vendorRes = await db.collection(DB_CONFIG.COLLECTIONS.VENDORS).insertMany(vendors);

  // 2. Customers
  const customers = [
    { name: 'Rajesh Garments', phone: '9123456780', address: 'Chennai, TN', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Priya Fashion House', phone: '9123456781', address: 'Delhi', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Metro Tailors', phone: '9123456782', address: 'Hyderabad, TS', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Royal Boutiques', phone: '9123456783', address: 'Kolkata, WB', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Modern Wear', phone: '9123456784', address: 'Pune, MH', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
  ];
  await db.collection(DB_CONFIG.COLLECTIONS.CUSTOMERS).insertMany(customers);

  // 3. Categories
  const categories = [
    { name: 'Cotton', description: 'Pure cotton fabrics', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Silk', description: 'Premium silk', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Polyester', description: 'Synthetic blends', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Linen', description: 'High quality linen', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
  ];
  await db.collection(DB_CONFIG.COLLECTIONS.CATEGORIES).insertMany(categories);

  // 4. Colors
  const colors = [
    { name: 'Red', hex_code: '#FF0000', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Blue', hex_code: '#0000FF', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'White', hex_code: '#FFFFFF', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Black', hex_code: '#000000', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Green', hex_code: '#00FF00', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Yellow', hex_code: '#FFFF00', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
  ];
  await db.collection(DB_CONFIG.COLLECTIONS.COLORS).insertMany(colors);

  // 5. Products
  const products = [
    { name: 'Premium Cotton Roll', category: 'Cotton', description: '100% pure cotton', unit: 'meter', reorder_level: 50, status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Mysore Silk Saree', category: 'Silk', description: 'Traditional wear', unit: 'piece', reorder_level: 10, status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Polyester Blend 40s', category: 'Polyester', description: 'Durable blend', unit: 'kg', reorder_level: 100, status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Linen Shirting', category: 'Linen', description: 'Breathable linen', unit: 'meter', reorder_level: 30, status: 'active', is_demo: true, createdAt: now, updatedAt: now },
  ];
  await db.collection(DB_CONFIG.COLLECTIONS.PRODUCTS).insertMany(products);
};

export const startDemo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Clear any old demo data
  await clearDemoData();
  
  // Re-seed demo data
  await seedDemoData();

  // Generate a token for the demo user
  const token = generateToken({
    userId: DEMO_USER_ID,
    mobile: '0000000000',
  });

  res.json({
    message: 'Demo started successfully',
    token,
    user: {
      id: DEMO_USER_ID,
      name: 'Demo User',
      mobile: '0000000000',
    }
  });
});

export const resetDemo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await clearDemoData();
  await seedDemoData();
  
  res.json({
    message: 'Demo data reset successfully'
  });
});

export const getDemoStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.json({
    active: true,
    message: 'Demo mode is available'
  });
});
