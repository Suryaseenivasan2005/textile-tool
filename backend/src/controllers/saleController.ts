import { Request, Response } from 'express';
import { ObjectId, Filter } from 'mongodb';
import { getDB } from '../config/database';
import { DB_CONFIG } from '../constants';
import { asyncHandler } from '../middleware/asyncHandler';
import { saleSchema, saleUpdateSchema } from '../validators/saleValidators';
import { CreateSaleDTO, UpdateSaleDTO } from '../types';
import { withDemoQuery, withDemoData } from '../utils/demo';

export const getSales = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const db = getDB();
  const salesCollection = db.collection(DB_CONFIG.COLLECTIONS.SALES);
  const customersCollection = db.collection(DB_CONFIG.COLLECTIONS.CUSTOMERS);

  const { search, customer_id, payment_type } = req.query;
  const query: Filter<any> = {};

  if (customer_id) {
    query.customer_id = new ObjectId(customer_id as string);
  }

  if (payment_type) {
    query.payment_type = payment_type;
  }

  if (search) {
    query.$or = [
      { invoice_no: { $regex: search, $options: 'i' } },
    ];
  }

  const sales = await salesCollection.find(withDemoQuery(req, query)).sort({ createdAt: -1 }).toArray();

  // Populate customer information
  const formattedSales = await Promise.all(
    sales.map(async (sale) => {
      const customer = sale.customer_id
        ? await customersCollection.findOne(withDemoQuery(req, { _id: sale.customer_id }))
        : null;

      return {
        id: sale._id.toString(),
        invoice_no: sale.invoice_no,
        customer_id: sale.customer_id ? sale.customer_id.toString() : null,
        invoice_date: sale.invoice_date,
        subtotal: sale.subtotal,
        gst_amount: sale.gst_amount,
        discount: sale.discount,
        total_amount: sale.total_amount,
        payment_type: sale.payment_type,
        customer: customer
          ? {
            id: customer._id.toString(),
            name: customer.name,
            phone: customer.phone || null,
          }
          : null,
        created_at: sale.createdAt,
        updated_at: sale.updatedAt,
      };
    })
  );

  res.json(formattedSales);
});

export const getSale = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid sale ID' });
    return;
  }

  const db = getDB();
  const salesCollection = db.collection(DB_CONFIG.COLLECTIONS.SALES);
  const saleItemsCollection = db.collection(DB_CONFIG.COLLECTIONS.SALE_ITEMS);
  const customersCollection = db.collection(DB_CONFIG.COLLECTIONS.CUSTOMERS);
  const productsCollection = db.collection(DB_CONFIG.COLLECTIONS.PRODUCTS);

  const sale = await salesCollection.findOne(withDemoQuery(req, { _id: new ObjectId(id) }));

  if (!sale) {
    res.status(404).json({ error: 'Sale not found' });
    return;
  }

  // Get customer
  const customer = sale.customer_id
    ? await customersCollection.findOne(withDemoQuery(req, { _id: sale.customer_id }))
    : null;

  // Get items
  const items = await saleItemsCollection.find(withDemoQuery(req, { sale_id: new ObjectId(id) })).toArray();

  // Populate product information
  const formattedItems = await Promise.all(
    items.map(async (item) => {
      const product = await productsCollection.findOne(withDemoQuery(req, { _id: item.product_id }));
      return {
        sale_id: item.sale_id.toString(),
        product_id: item.product_id.toString(),
        quantity: item.quantity,
        rate: item.rate,
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
    id: sale._id.toString(),
    invoice_no: sale.invoice_no,
    customer_id: sale.customer_id ? sale.customer_id.toString() : null,
    invoice_date: sale.invoice_date,
    subtotal: sale.subtotal,
    gst_amount: sale.gst_amount,
    discount: sale.discount,
    total_amount: sale.total_amount,
    payment_type: sale.payment_type,
    customer: customer
      ? {
        id: customer._id.toString(),
        name: customer.name,
        phone: customer.phone || null,
        address: customer.address || null,
      }
      : null,
    items: formattedItems,
    created_at: sale.createdAt,
    updated_at: sale.updatedAt,
  });
});

export const createSale = asyncHandler(async (req: Request<any, any, CreateSaleDTO>, res: Response): Promise<void> => {
  const validatedData = saleSchema.parse(req.body);
  const { customer_id, invoice_no, invoice_date, items, discount, payment_type } = validatedData;

  const db = getDB();
  const salesCollection = db.collection(DB_CONFIG.COLLECTIONS.SALES);
  const saleItemsCollection = db.collection(DB_CONFIG.COLLECTIONS.SALE_ITEMS);
  const inventoryCollection = db.collection(DB_CONFIG.COLLECTIONS.INVENTORY);
  const customersCollection = db.collection(DB_CONFIG.COLLECTIONS.CUSTOMERS);

  // Validate customer if provided
  if (customer_id) {
    if (!ObjectId.isValid(customer_id)) {
      res.status(400).json({ error: 'Invalid customer ID' });
      return;
    }

    const customer = await customersCollection.findOne(withDemoQuery(req, { _id: new ObjectId(customer_id) }));
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
  }

  // Validate inventory availability
  for (const item of items) {
    if (!ObjectId.isValid(item.product_id)) {
      res.status(400).json({ error: `Invalid product ID: ${item.product_id}` });
      return;
    }

    const productId = new ObjectId(item.product_id);
    const inventory = await inventoryCollection.findOne(withDemoQuery(req, { product_id: productId }));

    if (!inventory || inventory.quantity_available < item.quantity) {
      res.status(400).json({
        error: `Insufficient inventory for product ${item.product_id}`,
      });
      return;
    }
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const discountAmount = (subtotal * (discount || 0)) / 100;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const gstAmount = subtotalAfterDiscount * 0.18; // 18% GST
  const totalAmount = subtotalAfterDiscount + gstAmount;

  const now = new Date();

  // Create sale
  const saleDoc = {
    customer_id: customer_id ? new ObjectId(customer_id) : null,
    invoice_no,
    invoice_date,
    subtotal,
    gst_amount: gstAmount,
    discount: discount || 0,
    total_amount: totalAmount,
    payment_type: payment_type || 'cash',
    createdAt: now,
    updatedAt: now,
  };

  const saleResult = await salesCollection.insertOne(withDemoData(req, saleDoc));

  const saleId = saleResult.insertedId;

  // Create sale items and update inventory
  const saleItems = await Promise.all(
    items.map(async (item) => {
      const productId = new ObjectId(item.product_id);

      // Create sale item
      await saleItemsCollection.insertOne(withDemoData(req, {
        sale_id: saleId,
        product_id: productId,
        quantity: item.quantity,
        rate: item.rate,
        createdAt: now,
        updatedAt: now,
      }));

      // Update inventory (reduce stock)
      await inventoryCollection.updateOne(
        withDemoQuery(req, { product_id: productId }),
        {
          $inc: { quantity_available: -item.quantity },
          $set: { updatedAt: now },
        }
      );

      return {
        sale_id: saleId.toString(),
        product_id: item.product_id,
        quantity: item.quantity,
        rate: item.rate,
      };
    })
  );

  res.status(201).json({
    id: saleId.toString(),
    customer_id: customer_id || null,
    invoice_no,
    invoice_date,
    subtotal,
    gst_amount: gstAmount,
    discount: discount || 0,
    total_amount: totalAmount,
    payment_type: payment_type || 'cash',
    items: saleItems,
    created_at: now,
    updated_at: now,
  });
});

export const updateSale = asyncHandler(async (req: Request<any, any, UpdateSaleDTO>, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid sale ID' });
    return;
  }

  const validatedData = saleUpdateSchema.parse(req.body);

  const db = getDB();
  const salesCollection = db.collection(DB_CONFIG.COLLECTIONS.SALES);

  const sale = await salesCollection.findOne(withDemoQuery(req, { _id: new ObjectId(id) }));
  if (!sale) {
    res.status(404).json({ error: 'Sale not found' });
    return;
  }

  // If items are being updated, recalculate totals
  const updateData: Record<string, any> = { ...validatedData };

  if (validatedData.items) {
    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0
    );
    // Use new discount if provided, else use existing
    const currentDiscount = validatedData.discount !== undefined ? validatedData.discount : sale.discount;

    const discountAmount = (subtotal * currentDiscount) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const gstAmount = subtotalAfterDiscount * 0.18;
    const totalAmount = subtotalAfterDiscount + gstAmount;

    updateData.subtotal = subtotal;
    updateData.gst_amount = gstAmount;
    updateData.total_amount = totalAmount;
  } else if (validatedData.discount !== undefined) {
    // New discount but same items, recalculate totals based on old subtotal
    const subtotal = sale.subtotal;
    const discountAmount = (subtotal * validatedData.discount) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const gstAmount = subtotalAfterDiscount * 0.18;
    const totalAmount = subtotalAfterDiscount + gstAmount;

    // We already have subtotal in DB, just update derived
    updateData.gst_amount = gstAmount;
    updateData.total_amount = totalAmount;
  }

  await salesCollection.updateOne(
    withDemoQuery(req, { _id: new ObjectId(id) }),
    { $set: { ...updateData, updatedAt: new Date() } }
  );

  const updatedSale = await salesCollection.findOne(withDemoQuery(req, { _id: new ObjectId(id) }));

  res.json({
    id: updatedSale!._id.toString(),
    customer_id: updatedSale!.customer_id ? updatedSale!.customer_id.toString() : null,
    invoice_no: updatedSale!.invoice_no,
    invoice_date: updatedSale!.invoice_date,
    subtotal: updatedSale!.subtotal,
    gst_amount: updatedSale!.gst_amount,
    discount: updatedSale!.discount,
    total_amount: updatedSale!.total_amount,
    payment_type: updatedSale!.payment_type,
    created_at: updatedSale!.createdAt,
    updated_at: updatedSale!.updatedAt,
  });
});
