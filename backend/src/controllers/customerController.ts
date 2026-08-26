import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database';
import { DB_CONFIG } from '../constants';
import { asyncHandler } from '../middleware/asyncHandler';
import { customerSchema, customerUpdateSchema } from '../validators/customerValidators';
import { withDemoQuery, withDemoData } from '../utils/demo';

export const getCustomers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const db = getDB();
  const customersCollection = db.collection(DB_CONFIG.COLLECTIONS.CUSTOMERS);
  
  const { search } = req.query;
  const query: any = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { gst_number: { $regex: search, $options: 'i' } },
    ];
  }
  
  const customers = await customersCollection.find(withDemoQuery(req, query)).sort({ createdAt: -1 }).toArray();
  
  const formattedCustomers = customers.map((customer) => ({
    id: customer._id.toString(),
    name: customer.name,
    gst_number: customer.gst_number || null,
    phone: customer.phone || null,
    address: customer.address || null,
    created_at: customer.createdAt,
    updated_at: customer.updatedAt,
  }));
  
  res.json(formattedCustomers);
});

export const getCustomer = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid customer ID' });
    return;
  }
  
  const db = getDB();
  const customersCollection = db.collection(DB_CONFIG.COLLECTIONS.CUSTOMERS);
  
  const customer = await customersCollection.findOne(withDemoQuery(req, { _id: new ObjectId(id) }));
  
  if (!customer) {
    res.status(404).json({ error: 'Customer not found' });
    return;
  }
  
  res.json({
    id: customer._id.toString(),
    name: customer.name,
    gst_number: customer.gst_number || null,
    phone: customer.phone || null,
    address: customer.address || null,
    created_at: customer.createdAt,
    updated_at: customer.updatedAt,
  });
});

export const createCustomer = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const validatedData = customerSchema.parse(req.body);
  
  const db = getDB();
  const customersCollection = db.collection(DB_CONFIG.COLLECTIONS.CUSTOMERS);
  
  const now = new Date();
  const result = await customersCollection.insertOne(withDemoData(req, {
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

export const updateCustomer = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid customer ID' });
    return;
  }
  
  const validatedData = customerUpdateSchema.parse(req.body);
  
  const db = getDB();
  const customersCollection = db.collection(DB_CONFIG.COLLECTIONS.CUSTOMERS);
  
  const customer = await customersCollection.findOne(withDemoQuery(req, { _id: new ObjectId(id) }));
  if (!customer) {
    res.status(404).json({ error: 'Customer not found' });
    return;
  }
  
  await customersCollection.updateOne(
    withDemoQuery(req, { _id: new ObjectId(id) }),
    { $set: { ...validatedData, updatedAt: new Date() } }
  );
  
  const updatedCustomer = await customersCollection.findOne(withDemoQuery(req, { _id: new ObjectId(id) }));
  
  res.json({
    id: updatedCustomer!._id.toString(),
    name: updatedCustomer!.name,
    gst_number: updatedCustomer!.gst_number || null,
    phone: updatedCustomer!.phone || null,
    address: updatedCustomer!.address || null,
    created_at: updatedCustomer!.createdAt,
    updated_at: updatedCustomer!.updatedAt,
  });
});

export const deleteCustomer = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid customer ID' });
    return;
  }
  
  const db = getDB();
  const customersCollection = db.collection(DB_CONFIG.COLLECTIONS.CUSTOMERS);
  
  const customer = await customersCollection.findOne(withDemoQuery(req, { _id: new ObjectId(id) }));
  if (!customer) {
    res.status(404).json({ error: 'Customer not found' });
    return;
  }
  
  await customersCollection.deleteOne(withDemoQuery(req, { _id: new ObjectId(id) }));
  
  res.json({ message: 'Customer deleted successfully' });
});

