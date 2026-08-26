import { Request, Response } from 'express';
import { getDB } from '../config/database';
import { DB_CONFIG } from '../constants';
import { asyncHandler } from '../middleware/asyncHandler';
import { withDemoQuery } from '../utils/demo';

export const getDashboardStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const db = getDB();
  
  // Get counts
  const productsCount = await db.collection(DB_CONFIG.COLLECTIONS.PRODUCTS).countDocuments(withDemoQuery(req, { status: 'active' }));
  const vendorsCount = await db.collection(DB_CONFIG.COLLECTIONS.VENDORS).countDocuments(withDemoQuery(req, { status: 'active' }));
  const customersCount = await db.collection(DB_CONFIG.COLLECTIONS.CUSTOMERS).countDocuments(withDemoQuery(req, {}));
  
  // Get purchase totals
  const purchases = await db
    .collection(DB_CONFIG.COLLECTIONS.PURCHASES)
    .aggregate([
      { $match: withDemoQuery(req, {}) },
      {
        $group: {
          _id: null,
          total: { $sum: '$total_amount' },
        },
      },
    ])
    .toArray();
  const totalPurchases = purchases[0]?.total || 0;
  
  // Get sales totals
  const sales = await db
    .collection(DB_CONFIG.COLLECTIONS.SALES)
    .aggregate([
      { $match: withDemoQuery(req, {}) },
      {
        $group: {
          _id: null,
          total: { $sum: '$total_amount' },
        },
      },
    ])
    .toArray();
  const totalSales = sales[0]?.total || 0;
  
  // Calculate profit
  const profit = totalSales - totalPurchases;
  
  res.json({
    total_products: productsCount,
    total_purchases: totalPurchases,
    total_sales: totalSales,
    profit: profit,
  });
});

