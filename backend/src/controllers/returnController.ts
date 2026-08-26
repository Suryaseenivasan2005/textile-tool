import { Request, Response } from 'express';
import { ObjectId, Filter } from 'mongodb';
import { getDB } from '../config/database';
import { DB_CONFIG } from '../constants';
import { asyncHandler } from '../middleware/asyncHandler';
import { returnSchema } from '../validators/returnValidators';
import { withDemoQuery, withDemoData } from '../utils/demo';

export const getReturns = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const db = getDB();
  const returnsCollection = db.collection(DB_CONFIG.COLLECTIONS.RETURNS);

  const { search, type } = req.query;
  const query: Filter<any> = {};

  if (type && type !== 'all') {
    query.type = type;
  }

  if (search) {
    query.reference_invoice_id = { $regex: search, $options: 'i' };
  }

  const returns = await returnsCollection.find(withDemoQuery(req, query)).sort({ createdAt: -1 }).toArray();

  const formattedReturns = returns.map((returnItem) => ({
    id: returnItem._id.toString(),
    type: returnItem.type,
    reference_invoice_id: returnItem.reference_invoice_id.toString(),
    date: returnItem.date,
    total_amount: returnItem.total_amount,
    created_at: returnItem.createdAt,
    updated_at: returnItem.updatedAt,
  }));

  res.json(formattedReturns);
});

export const getReturn = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid return ID' });
    return;
  }

  const db = getDB();
  const returnsCollection = db.collection(DB_CONFIG.COLLECTIONS.RETURNS);
  const returnItemsCollection = db.collection(DB_CONFIG.COLLECTIONS.RETURN_ITEMS);
  const productsCollection = db.collection(DB_CONFIG.COLLECTIONS.PRODUCTS);

  const returnItem = await returnsCollection.findOne(withDemoQuery(req, { _id: new ObjectId(id) }));

  if (!returnItem) {
    res.status(404).json({ error: 'Return not found' });
    return;
  }

  // Get items
  const items = await returnItemsCollection.find(withDemoQuery(req, { return_id: new ObjectId(id) })).toArray();

  // Populate product information
  const formattedItems = await Promise.all(
    items.map(async (item) => {
      const product = await productsCollection.findOne(withDemoQuery(req, { _id: item.product_id }));
      return {
        return_id: item.return_id.toString(),
        product_id: item.product_id.toString(),
        quantity: item.quantity,
        product: product
          ? {
            id: product._id.toString(),
            name: product.name,
            unit: product.unit,
          }
          : null,
      };
    })
  );

  res.json({
    id: returnItem._id.toString(),
    type: returnItem.type,
    reference_invoice_id: returnItem.reference_invoice_id.toString(),
    date: returnItem.date,
    total_amount: returnItem.total_amount,
    items: formattedItems,
    created_at: returnItem.createdAt,
    updated_at: returnItem.updatedAt,
  });
});

export const createReturn = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const validatedData = returnSchema.parse(req.body);
  const { type, reference_invoice_id, date, items } = validatedData;

  const db = getDB();
  const returnsCollection = db.collection(DB_CONFIG.COLLECTIONS.RETURNS);
  const returnItemsCollection = db.collection(DB_CONFIG.COLLECTIONS.RETURN_ITEMS);
  const inventoryCollection = db.collection(DB_CONFIG.COLLECTIONS.INVENTORY);
  const productsCollection = db.collection(DB_CONFIG.COLLECTIONS.PRODUCTS);

  // Validate reference invoice exists
  if (!ObjectId.isValid(reference_invoice_id)) {
    res.status(400).json({ error: 'Invalid reference invoice ID' });
    return;
  }

  const referenceId = new ObjectId(reference_invoice_id);

  // Check if reference invoice exists (purchase or sale)
  if (type === 'purchase') {
    const purchase = await db
      .collection(DB_CONFIG.COLLECTIONS.PURCHASES)
      .findOne(withDemoQuery(req, { _id: referenceId }));
    if (!purchase) {
      res.status(404).json({ error: 'Reference purchase not found' });
      return;
    }
  } else {
    const sale = await db.collection(DB_CONFIG.COLLECTIONS.SALES).findOne(withDemoQuery(req, { _id: referenceId }));
    if (!sale) {
      res.status(404).json({ error: 'Reference sale not found' });
      return;
    }
  }

  // Calculate total amount
  let totalAmount = 0;
  for (const item of items) {
    if (!ObjectId.isValid(item.product_id)) {
      res.status(400).json({ error: `Invalid product ID: ${item.product_id}` });
      return;
    }

    const product = await productsCollection.findOne(withDemoQuery(req, { _id: new ObjectId(item.product_id) }));
    if (!product) {
      res.status(404).json({ error: `Product not found: ${item.product_id}` });
      return;
    }

    totalAmount += item.quantity * product.cost_price;
  }

  const now = new Date();

  // Create return
  const returnResult = await returnsCollection.insertOne(withDemoData(req, {
    type,
    reference_invoice_id: referenceId,
    date,
    total_amount: totalAmount,
    createdAt: now,
    updatedAt: now,
  }));

  const returnId = returnResult.insertedId;

  // Create return items and update inventory
  const returnItems = await Promise.all(
    items.map(async (item) => {
      const productId = new ObjectId(item.product_id);

      // Create return item
      await returnItemsCollection.insertOne(withDemoData(req, {
        return_id: returnId,
        product_id: productId,
        quantity: item.quantity,
        createdAt: now,
        updatedAt: now,
      }));

      // Update inventory
      // For purchase returns: reduce stock (returning to vendor)
      // For sales returns: add stock (customer returning)
      const quantityChange = type === 'purchase' ? -item.quantity : item.quantity;

      await inventoryCollection.updateOne(
        withDemoQuery(req, { product_id: productId }),
        {
          $inc: { quantity_available: quantityChange },
          $set: { updatedAt: now },
        }
      );

      return {
        return_id: returnId.toString(),
        product_id: item.product_id,
        quantity: item.quantity,
      };
    })
  );

  res.status(201).json({
    id: returnId.toString(),
    type,
    reference_invoice_id: reference_invoice_id,
    date,
    total_amount: totalAmount,
    items: returnItems,
    created_at: now,
    updated_at: now,
  });
});

