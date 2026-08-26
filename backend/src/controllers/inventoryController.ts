import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database';
import { DB_CONFIG } from '../constants';
import { asyncHandler } from '../middleware/asyncHandler';
import { withDemoQuery } from '../utils/demo';

export const getInventory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const db = getDB();
  const inventoryCollection = db.collection(DB_CONFIG.COLLECTIONS.INVENTORY);
  const productsCollection = db.collection(DB_CONFIG.COLLECTIONS.PRODUCTS);
  
  const { product_id } = req.query;
  const query: any = {};
  
  if (product_id) {
    if (!ObjectId.isValid(product_id as string)) {
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }
    query.product_id = new ObjectId(product_id as string);
  }
  
  const inventory = await inventoryCollection.find(withDemoQuery(req, query)).toArray();
  
  // Populate product information
  const formattedInventory = await Promise.all(
    inventory.map(async (item) => {
      const product = await productsCollection.findOne(withDemoQuery(req, { _id: item.product_id }));
      return {
        product_id: item.product_id.toString(),
        quantity_available: item.quantity_available || 0,
        product: product
          ? {
              id: product._id.toString(),
              name: product.name,
              unit: product.unit,
              category: product.category || null,
              color: product.color || null,
            }
          : null,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
      };
    })
  );
  
  res.json(formattedInventory);
});

export const adjustInventory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { product_id, quantity, type, reason } = req.body;
  
  if (!product_id || !ObjectId.isValid(product_id)) {
    res.status(400).json({ error: 'Valid product ID is required' });
    return;
  }
  
  if (typeof quantity !== 'number' || quantity === 0) {
    res.status(400).json({ error: 'Valid quantity is required' });
    return;
  }
  
  if (!['in', 'out', 'adjustment'].includes(type)) {
    res.status(400).json({ error: 'Invalid adjustment type' });
    return;
  }
  
  const db = getDB();
  const inventoryCollection = db.collection(DB_CONFIG.COLLECTIONS.INVENTORY);
  const productsCollection = db.collection(DB_CONFIG.COLLECTIONS.PRODUCTS);
  
  const product = await productsCollection.findOne(withDemoQuery(req, { _id: new ObjectId(product_id) }));
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  
  const productId = new ObjectId(product_id);
  const now = new Date();
  
  // Get current inventory
  const currentInventory = await inventoryCollection.findOne(withDemoQuery(req, { product_id: productId }));
  const currentQuantity = currentInventory?.quantity_available || 0;
  
  // Calculate new quantity
  let newQuantity: number;
  if (type === 'in') {
    newQuantity = currentQuantity + Math.abs(quantity);
  } else if (type === 'out') {
    newQuantity = currentQuantity - Math.abs(quantity);
    if (newQuantity < 0) {
      res.status(400).json({ error: 'Insufficient inventory' });
      return;
    }
  } else {
    // adjustment - set to exact value
    newQuantity = quantity;
    if (newQuantity < 0) {
      res.status(400).json({ error: 'Quantity cannot be negative' });
      return;
    }
  }
  
  // Update inventory
  await inventoryCollection.updateOne(
    withDemoQuery(req, { product_id: productId }),
    {
      $set: {
        quantity_available: newQuantity,
        updatedAt: now,
      },
    },
    { upsert: true }
  );
  
  res.json({
    product_id,
    previous_quantity: currentQuantity,
    new_quantity: newQuantity,
    adjustment: newQuantity - currentQuantity,
    type,
    reason: reason || null,
    updated_at: now,
  });
});

