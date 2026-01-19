import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database';
import { DB_CONFIG } from '../constants';
import { asyncHandler } from '../middleware/asyncHandler';
import { productSchema, productUpdateSchema } from '../validators/productValidators';

export const getProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const db = getDB();
  const productsCollection = db.collection(DB_CONFIG.COLLECTIONS.PRODUCTS);
  
  const { search, category, status } = req.query;
  const query: any = {};
  
  if (status) {
    query.status = status;
  }
  
  if (category) {
    query.category = category;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { color: { $regex: search, $options: 'i' } },
      { design: { $regex: search, $options: 'i' } },
    ];
  }
  
  const products = await productsCollection.find(query).sort({ createdAt: -1 }).toArray();
  
  const formattedProducts = products.map((product) => ({
    id: product._id.toString(),
    name: product.name,
    category: product.category || null,
    color: product.color || null,
    design: product.design || null,
    unit: product.unit,
    cost_price: product.cost_price,
    selling_price: product.selling_price,
    status: product.status || 'active',
    created_at: product.createdAt,
    updated_at: product.updatedAt,
  }));
  
  res.json(formattedProducts);
});

export const getProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid product ID' });
    return;
  }
  
  const db = getDB();
  const productsCollection = db.collection(DB_CONFIG.COLLECTIONS.PRODUCTS);
  
  const product = await productsCollection.findOne({ _id: new ObjectId(id) });
  
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  
  res.json({
    id: product._id.toString(),
    name: product.name,
    category: product.category || null,
    color: product.color || null,
    design: product.design || null,
    unit: product.unit,
    cost_price: product.cost_price,
    selling_price: product.selling_price,
    status: product.status || 'active',
    created_at: product.createdAt,
    updated_at: product.updatedAt,
  });
});

export const createProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const validatedData = productSchema.parse(req.body);
  
  const db = getDB();
  const productsCollection = db.collection(DB_CONFIG.COLLECTIONS.PRODUCTS);
  const inventoryCollection = db.collection(DB_CONFIG.COLLECTIONS.INVENTORY);
  
  const now = new Date();
  const result = await productsCollection.insertOne({
    ...validatedData,
    createdAt: now,
    updatedAt: now,
  });
  
  // Initialize inventory for new product
  await inventoryCollection.insertOne({
    product_id: result.insertedId,
    quantity_available: 0,
    createdAt: now,
    updatedAt: now,
  });
  
  res.status(201).json({
    id: result.insertedId.toString(),
    ...validatedData,
    created_at: now,
    updated_at: now,
  });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid product ID' });
    return;
  }
  
  const validatedData = productUpdateSchema.parse(req.body);
  
  const db = getDB();
  const productsCollection = db.collection(DB_CONFIG.COLLECTIONS.PRODUCTS);
  
  const product = await productsCollection.findOne({ _id: new ObjectId(id) });
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  
  await productsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...validatedData, updatedAt: new Date() } }
  );
  
  const updatedProduct = await productsCollection.findOne({ _id: new ObjectId(id) });
  
  res.json({
    id: updatedProduct!._id.toString(),
    name: updatedProduct!.name,
    category: updatedProduct!.category || null,
    color: updatedProduct!.color || null,
    design: updatedProduct!.design || null,
    unit: updatedProduct!.unit,
    cost_price: updatedProduct!.cost_price,
    selling_price: updatedProduct!.selling_price,
    status: updatedProduct!.status || 'active',
    created_at: updatedProduct!.createdAt,
    updated_at: updatedProduct!.updatedAt,
  });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid product ID' });
    return;
  }
  
  const db = getDB();
  const productsCollection = db.collection(DB_CONFIG.COLLECTIONS.PRODUCTS);
  
  const product = await productsCollection.findOne({ _id: new ObjectId(id) });
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  
  // Soft delete - set status to inactive
  await productsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: 'inactive', updatedAt: new Date() } }
  );
  
  res.json({ message: 'Product deactivated successfully' });
});

