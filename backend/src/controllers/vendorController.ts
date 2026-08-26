import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database';
import { DB_CONFIG } from '../constants';
import { asyncHandler } from '../middleware/asyncHandler';
import { vendorSchema, vendorUpdateSchema } from '../validators/vendorValidators';
import { withDemoQuery, withDemoData } from '../utils/demo';

export const getVendors = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const db = getDB();
  const vendorsCollection = db.collection(DB_CONFIG.COLLECTIONS.VENDORS);
  
  const { search, status } = req.query;
  const query: any = {};
  
  if (status) {
    query.status = status;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { gst_number: { $regex: search, $options: 'i' } },
    ];
  }
  
  const vendors = await vendorsCollection.find(withDemoQuery(req, query)).sort({ createdAt: -1 }).toArray();
  
  const formattedVendors = vendors.map((vendor) => ({
    id: vendor._id.toString(),
    name: vendor.name,
    gst_number: vendor.gst_number || null,
    phone: vendor.phone || null,
    address: vendor.address || null,
    status: vendor.status || 'active',
    created_at: vendor.createdAt,
    updated_at: vendor.updatedAt,
  }));
  
  res.json(formattedVendors);
});

export const getVendor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid vendor ID' });
    return;
  }
  
  const db = getDB();
  const vendorsCollection = db.collection(DB_CONFIG.COLLECTIONS.VENDORS);
  
  const vendor = await vendorsCollection.findOne(withDemoQuery(req, { _id: new ObjectId(id) }));
  
  if (!vendor) {
    res.status(404).json({ error: 'Vendor not found' });
    return;
  }
  
  res.json({
    id: vendor._id.toString(),
    name: vendor.name,
    gst_number: vendor.gst_number || null,
    phone: vendor.phone || null,
    address: vendor.address || null,
    status: vendor.status || 'active',
    created_at: vendor.createdAt,
    updated_at: vendor.updatedAt,
  });
});

export const createVendor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const validatedData = vendorSchema.parse(req.body);
  
  const db = getDB();
  const vendorsCollection = db.collection(DB_CONFIG.COLLECTIONS.VENDORS);
  
  const now = new Date();
  const result = await vendorsCollection.insertOne(withDemoData(req, {
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

export const updateVendor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid vendor ID' });
    return;
  }
  
  const validatedData = vendorUpdateSchema.parse(req.body);
  
  const db = getDB();
  const vendorsCollection = db.collection(DB_CONFIG.COLLECTIONS.VENDORS);
  
  const vendor = await vendorsCollection.findOne(withDemoQuery(req, { _id: new ObjectId(id) }));
  if (!vendor) {
    res.status(404).json({ error: 'Vendor not found' });
    return;
  }
  
  await vendorsCollection.updateOne(
    withDemoQuery(req, { _id: new ObjectId(id) }),
    { $set: { ...validatedData, updatedAt: new Date() } }
  );
  
  const updatedVendor = await vendorsCollection.findOne(withDemoQuery(req, { _id: new ObjectId(id) }));
  
  res.json({
    id: updatedVendor!._id.toString(),
    name: updatedVendor!.name,
    gst_number: updatedVendor!.gst_number || null,
    phone: updatedVendor!.phone || null,
    address: updatedVendor!.address || null,
    status: updatedVendor!.status || 'active',
    created_at: updatedVendor!.createdAt,
    updated_at: updatedVendor!.updatedAt,
  });
});

export const deleteVendor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid vendor ID' });
    return;
  }
  
  const db = getDB();
  const vendorsCollection = db.collection(DB_CONFIG.COLLECTIONS.VENDORS);
  
  // Check if vendor exists
  const vendor = await vendorsCollection.findOne(withDemoQuery(req, { _id: new ObjectId(id) }));
  if (!vendor) {
    res.status(404).json({ error: 'Vendor not found' });
    return;
  }
  
  // Soft delete - set status to inactive
  await vendorsCollection.updateOne(
    withDemoQuery(req, { _id: new ObjectId(id) }),
    { $set: { status: 'inactive', updatedAt: new Date() } }
  );
  
  res.json({ message: 'Vendor deactivated successfully' });
});

