import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database';
import { DB_CONFIG } from '../constants';
import { asyncHandler } from '../middleware/asyncHandler';
import { categorySchema, categoryUpdateSchema } from '../validators/categoryValidators';

export const getCategories = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const db = getDB();
  const categoriesCollection = db.collection(DB_CONFIG.COLLECTIONS.CATEGORIES);
  
  const { search, status } = req.query;
  const query: any = {};
  
  if (status) {
    query.status = status;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  
  const categories = await categoriesCollection.find(query).sort({ createdAt: -1 }).toArray();
  
  const formattedCategories = categories.map((category) => ({
    id: category._id.toString(),
    name: category.name,
    description: category.description || null,
    status: category.status || 'active',
    created_at: category.createdAt,
    updated_at: category.updatedAt,
  }));
  
  res.json(formattedCategories);
});

export const getCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid category ID' });
    return;
  }
  
  const db = getDB();
  const categoriesCollection = db.collection(DB_CONFIG.COLLECTIONS.CATEGORIES);
  
  const category = await categoriesCollection.findOne({ _id: new ObjectId(id) });
  
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  
  res.json({
    id: category._id.toString(),
    name: category.name,
    description: category.description || null,
    status: category.status || 'active',
    created_at: category.createdAt,
    updated_at: category.updatedAt,
  });
});

export const createCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const validatedData = categorySchema.parse(req.body);
  
  const db = getDB();
  const categoriesCollection = db.collection(DB_CONFIG.COLLECTIONS.CATEGORIES);
  
  const now = new Date();
  const result = await categoriesCollection.insertOne({
    ...validatedData,
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

export const updateCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid category ID' });
    return;
  }
  
  const validatedData = categoryUpdateSchema.parse(req.body);
  
  const db = getDB();
  const categoriesCollection = db.collection(DB_CONFIG.COLLECTIONS.CATEGORIES);
  
  const category = await categoriesCollection.findOne({ _id: new ObjectId(id) });
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  
  await categoriesCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...validatedData, updatedAt: new Date() } }
  );
  
  const updatedCategory = await categoriesCollection.findOne({ _id: new ObjectId(id) });
  
  res.json({
    id: updatedCategory!._id.toString(),
    name: updatedCategory!.name,
    description: updatedCategory!.description || null,
    status: updatedCategory!.status || 'active',
    created_at: updatedCategory!.createdAt,
    updated_at: updatedCategory!.updatedAt,
  });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid category ID' });
    return;
  }
  
  const db = getDB();
  const categoriesCollection = db.collection(DB_CONFIG.COLLECTIONS.CATEGORIES);
  
  const category = await categoriesCollection.findOne({ _id: new ObjectId(id) });
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  
  // Soft delete - set status to inactive
  await categoriesCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: 'inactive', updatedAt: new Date() } }
  );
  
  res.json({ message: 'Category deactivated successfully' });
});

