import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database';
import { DB_CONFIG } from '../constants';
import { asyncHandler } from '../middleware/asyncHandler';
import { paymentSchema } from '../validators/paymentValidators';
import { withDemoQuery, withDemoData } from '../utils/demo';

export const getPayments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const db = getDB();
  const paymentsCollection = db.collection(DB_CONFIG.COLLECTIONS.PAYMENTS);
  
  const { reference_type, reference_id, payment_mode } = req.query;
  const query: any = {};
  
  if (reference_type) {
    query.reference_type = reference_type;
  }
  
  if (reference_id) {
    query.reference_id = new ObjectId(reference_id as string);
  }
  
  if (payment_mode) {
    query.payment_mode = payment_mode;
  }
  
  const payments = await paymentsCollection.find(withDemoQuery(req, query)).sort({ createdAt: -1 }).toArray();
  
  const formattedPayments = payments.map((payment) => ({
    id: payment._id.toString(),
    reference_type: payment.reference_type,
    reference_id: payment.reference_id.toString(),
    amount: payment.amount,
    payment_mode: payment.payment_mode,
    payment_date: payment.payment_date,
    created_at: payment.createdAt,
    updated_at: payment.updatedAt,
  }));
  
  res.json(formattedPayments);
});

export const createPayment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const validatedData = paymentSchema.parse(req.body);
  const { reference_type, reference_id, amount, payment_mode, payment_date } = validatedData;
  
  const db = getDB();
  const paymentsCollection = db.collection(DB_CONFIG.COLLECTIONS.PAYMENTS);
  
  if (!ObjectId.isValid(reference_id)) {
    res.status(400).json({ error: 'Invalid reference ID' });
    return;
  }
  
  // Validate reference exists
  if (reference_type === 'vendor') {
    const vendor = await db
      .collection(DB_CONFIG.COLLECTIONS.VENDORS)
      .findOne(withDemoQuery(req, { _id: new ObjectId(reference_id) }));
    if (!vendor) {
      res.status(404).json({ error: 'Vendor not found' });
      return;
    }
  } else {
    const customer = await db
      .collection(DB_CONFIG.COLLECTIONS.CUSTOMERS)
      .findOne(withDemoQuery(req, { _id: new ObjectId(reference_id) }));
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
  }
  
  const now = new Date();
  const result = await paymentsCollection.insertOne(withDemoData(req, {
    reference_type,
    reference_id: new ObjectId(reference_id),
    amount,
    payment_mode,
    payment_date,
    createdAt: now,
    updatedAt: now,
  }));
  
  res.status(201).json({
    id: result.insertedId.toString(),
    reference_type,
    reference_id,
    amount,
    payment_mode,
    payment_date,
    created_at: now,
    updated_at: now,
  });
});

export const getLedger = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { type, id } = req.params;
  
  if (!['vendor', 'customer'].includes(type)) {
    res.status(400).json({ error: 'Invalid ledger type' });
    return;
  }
  
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }
  
  const db = getDB();
  const referenceId = new ObjectId(id);
  
  // Get purchases/sales
  const purchases =
    type === 'vendor'
      ? await db
          .collection(DB_CONFIG.COLLECTIONS.PURCHASES)
          .find(withDemoQuery(req, { vendor_id: referenceId }))
          .toArray()
      : [];
  
  const sales =
    type === 'customer'
      ? await db
          .collection(DB_CONFIG.COLLECTIONS.SALES)
          .find(withDemoQuery(req, { customer_id: referenceId }))
          .toArray()
      : [];
  
  // Get payments
  const payments = await db
    .collection(DB_CONFIG.COLLECTIONS.PAYMENTS)
    .find(withDemoQuery(req, {
      reference_type: type,
      reference_id: referenceId,
    }))
    .toArray();
  
  // Build ledger entries
  const ledger: any[] = [];
  
  // Add purchase entries (debit)
  purchases.forEach((purchase) => {
    ledger.push({
      date: purchase.invoice_date,
      type: 'purchase',
      reference_id: purchase._id.toString(),
      description: `Purchase Invoice ${purchase.invoice_no}`,
      debit: purchase.total_amount,
      credit: 0,
    });
  });
  
  // Add sale entries (credit)
  sales.forEach((sale) => {
    ledger.push({
      date: sale.invoice_date,
      type: 'sale',
      reference_id: sale._id.toString(),
      description: `Sale Invoice ${sale.invoice_no}`,
      debit: 0,
      credit: sale.total_amount,
    });
  });
  
  // Add payment entries
  payments.forEach((payment) => {
    if (type === 'vendor') {
      // Payment to vendor is credit
      ledger.push({
        date: payment.payment_date,
        type: 'payment',
        reference_id: payment._id.toString(),
        description: `Payment (${payment.payment_mode})`,
        debit: 0,
        credit: payment.amount,
      });
    } else {
      // Payment from customer is debit
      ledger.push({
        date: payment.payment_date,
        type: 'payment',
        reference_id: payment._id.toString(),
        description: `Payment (${payment.payment_mode})`,
        debit: payment.amount,
        credit: 0,
      });
    }
  });
  
  // Sort by date
  ledger.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Calculate running balance
  let balance = 0;
  const ledgerWithBalance = ledger.map((entry) => {
    balance = balance + entry.debit - entry.credit;
    return {
      ...entry,
      balance,
    };
  });
  
  res.json({
    type,
    reference_id: id,
    entries: ledgerWithBalance,
    current_balance: balance,
  });
});

