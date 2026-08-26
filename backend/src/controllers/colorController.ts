import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database';
import { DB_CONFIG } from '../constants';
import { asyncHandler } from '../middleware/asyncHandler';
import { colorSchema, colorUpdateSchema } from '../validators/colorValidators';
import { withDemoQuery, withDemoData } from '../utils/demo';

export const getColors = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const db = getDB();
  const colorsCollection = db.collection(DB_CONFIG.COLLECTIONS.COLORS);
  
  const { search, status } = req.query;
  const query: any = {};
  
  if (status) {
    query.status = status;
  }
  
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  
  const colors = await colorsCollection.find(withDemoQuery(req, query)).sort({ createdAt: -1 }).toArray();
  
  const formattedColors = colors.map((color) => ({
    id: color._id.toString(),
    name: color.name,
    hex_code: color.hex_code || null,
    status: color.status || 'active',
    created_at: color.createdAt,
    updated_at: color.updatedAt,
  }));
  
  res.json(formattedColors);
});

export const getColor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid color ID' });
    return;
  }
  
  const db = getDB();
  const colorsCollection = db.collection(DB_CONFIG.COLLECTIONS.COLORS);
  
  const color = await colorsCollection.findOne(withDemoQuery(req, { _id: new ObjectId(id) }));
  
  if (!color) {
    res.status(404).json({ error: 'Color not found' });
    return;
  }
  
  res.json({
    id: color._id.toString(),
    name: color.name,
    hex_code: color.hex_code || null,
    status: color.status || 'active',
    created_at: color.createdAt,
    updated_at: color.updatedAt,
  });
});

export const createColor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const validatedData = colorSchema.parse(req.body);
  
  const db = getDB();
  const colorsCollection = db.collection(DB_CONFIG.COLLECTIONS.COLORS);
  
  const now = new Date();
  const result = await colorsCollection.insertOne(withDemoData(req, {
    ...validatedData,
    createdAt: now,
    updatedAt: now,
  }));
  
  res.status(201).json({
    id: result.insertedId.toString(),
    ...validatedData,
    created_at: now,
    updated_at: now,
  });
});

export const updateColor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid color ID' });
    return;
  }
  
  const validatedData = colorUpdateSchema.parse(req.body);
  
  const db = getDB();
  const colorsCollection = db.collection(DB_CONFIG.COLLECTIONS.COLORS);
  
  const color = await colorsCollection.findOne(withDemoQuery(req, { _id: new ObjectId(id) }));
  if (!color) {
    res.status(404).json({ error: 'Color not found' });
    return;
  }
  
  await colorsCollection.updateOne(
    withDemoQuery(req, { _id: new ObjectId(id) }),
    { $set: { ...validatedData, updatedAt: new Date() } }
  );
  
  const updatedColor = await colorsCollection.findOne(withDemoQuery(req, { _id: new ObjectId(id) }));
  
  res.json({
    id: updatedColor!._id.toString(),
    name: updatedColor!.name,
    hex_code: updatedColor!.hex_code || null,
    status: updatedColor!.status || 'active',
    created_at: updatedColor!.createdAt,
    updated_at: updatedColor!.updatedAt,
  });
});

export const deleteColor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid color ID' });
    return;
  }
  
  const db = getDB();
  const colorsCollection = db.collection(DB_CONFIG.COLLECTIONS.COLORS);
  
  const color = await colorsCollection.findOne(withDemoQuery(req, { _id: new ObjectId(id) }));
  if (!color) {
    res.status(404).json({ error: 'Color not found' });
    return;
  }
  
  // Soft delete - set status to inactive
  await colorsCollection.updateOne(
    withDemoQuery(req, { _id: new ObjectId(id) }),
    { $set: { status: 'inactive', updatedAt: new Date() } }
  );
  
  res.json({ message: 'Color deactivated successfully' });
});

