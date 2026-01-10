import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database';
import { DB_CONFIG } from '../constants';
import { asyncHandler } from '../middleware/asyncHandler';
import { purchaseSchema, purchaseUpdateSchema } from '../validators/purchaseValidators';

export const getPurchases = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const db = getDB();
  const purchasesCollection = db.collection(DB_CONFIG.COLLECTIONS.PURCHASES);
  const vendorsCollection = db.collection(DB_CONFIG.COLLECTIONS.VENDORS);

  const { search, vendor_id, payment_status } = req.query;
  const query: any = {};

  if (vendor_id) {
    query.vendor_id = new ObjectId(vendor_id as string);
  }

  if (payment_status) {
    query.payment_status = payment_status;
  }

  if (search) {
    query.$or = [
      { invoice_no: { $regex: search, $options: 'i' } },
    ];
  }

  const purchases = await purchasesCollection.find(query).sort({ createdAt: -1 }).toArray();

  // Populate vendor information
  const formattedPurchases = await Promise.all(
    purchases.map(async (purchase) => {
      const vendor = purchase.vendor_id
        ? await vendorsCollection.findOne({ _id: purchase.vendor_id })
        : null;

      return {
        id: purchase._id.toString(),
        vendor_id: purchase.vendor_id.toString(),
        invoice_no: purchase.invoice_no,
        invoice_date: purchase.invoice_date,
        subtotal: purchase.subtotal,
        gst_amount: purchase.gst_amount,
        total_amount: purchase.total_amount,
        payment_status: purchase.payment_status,
        vendor: vendor
          ? {
            id: vendor._id.toString(),
            name: vendor.name,
            phone: vendor.phone || null,
          }
          : null,
        created_at: purchase.createdAt,
        updated_at: purchase.updatedAt,
      };
    })
  );

  res.json(formattedPurchases);
});

export const getPurchase = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid purchase ID' });
    return;
  }

  const db = getDB();
  const purchasesCollection = db.collection(DB_CONFIG.COLLECTIONS.PURCHASES);
  const purchaseItemsCollection = db.collection(DB_CONFIG.COLLECTIONS.PURCHASE_ITEMS);
  const vendorsCollection = db.collection(DB_CONFIG.COLLECTIONS.VENDORS);
  const productsCollection = db.collection(DB_CONFIG.COLLECTIONS.PRODUCTS);

  const purchase = await purchasesCollection.findOne({ _id: new ObjectId(id) });

  if (!purchase) {
    res.status(404).json({ error: 'Purchase not found' });
    return;
  }

  // Get vendor
  const vendor = await vendorsCollection.findOne({ _id: purchase.vendor_id });

  // Get items
  const items = await purchaseItemsCollection
    .find({ purchase_id: new ObjectId(id) })
    .toArray();

  // Populate product information
  const formattedItems = await Promise.all(
    items.map(async (item) => {
      const product = await productsCollection.findOne({ _id: item.product_id });
      return {
        purchase_id: item.purchase_id.toString(),
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
    id: purchase._id.toString(),
    vendor_id: purchase.vendor_id.toString(),
    invoice_no: purchase.invoice_no,
    invoice_date: purchase.invoice_date,
    subtotal: purchase.subtotal,
    gst_amount: purchase.gst_amount,
    total_amount: purchase.total_amount,
    payment_status: purchase.payment_status,
    vendor: vendor
      ? {
        id: vendor._id.toString(),
        name: vendor.name,
        phone: vendor.phone || null,
        address: vendor.address || null,
      }
      : null,
    items: formattedItems,
    created_at: purchase.createdAt,
    updated_at: purchase.updatedAt,
  });
});

export const createPurchase = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const validatedData = purchaseSchema.parse(req.body);
  const { vendor_id, invoice_no, invoice_date, items, payment_status } = validatedData;

  const db = getDB();
  const purchasesCollection = db.collection(DB_CONFIG.COLLECTIONS.PURCHASES);
  const purchaseItemsCollection = db.collection(DB_CONFIG.COLLECTIONS.PURCHASE_ITEMS);
  const inventoryCollection = db.collection(DB_CONFIG.COLLECTIONS.INVENTORY);
  const vendorsCollection = db.collection(DB_CONFIG.COLLECTIONS.VENDORS);

  // Validate vendor exists
  if (!ObjectId.isValid(vendor_id)) {
    res.status(400).json({ error: 'Invalid vendor ID' });
    return;
  }

  const vendor = await vendorsCollection.findOne({ _id: new ObjectId(vendor_id) });
  if (!vendor) {
    res.status(404).json({ error: 'Vendor not found' });
    return;
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const gstAmount = subtotal * 0.18; // 18% GST
  const totalAmount = subtotal + gstAmount;

  const now = new Date();

  // Create purchase
  const purchaseResult = await purchasesCollection.insertOne({
    vendor_id: new ObjectId(vendor_id),
    invoice_no,
    invoice_date,
    subtotal,
    gst_amount: gstAmount,
    total_amount: totalAmount,
    payment_status: payment_status || 'pending',
    createdAt: now,
    updatedAt: now,
  });

  const purchaseId = purchaseResult.insertedId;

  // Create purchase items and update inventory
  const purchaseItems = await Promise.all(
    items.map(async (item) => {
      if (!ObjectId.isValid(item.product_id)) {
        throw new Error(`Invalid product ID: ${item.product_id}`);
      }

      const productId = new ObjectId(item.product_id);

      // Create purchase item
      await purchaseItemsCollection.insertOne({
        purchase_id: purchaseId,
        product_id: productId,
        quantity: item.quantity,
        rate: item.rate,
        createdAt: now,
        updatedAt: now,
      });

      // Update inventory (add stock)
      await inventoryCollection.updateOne(
        { product_id: productId },
        {
          $inc: { quantity_available: item.quantity },
          $set: { updatedAt: now },
        },
        { upsert: true }
      );

      return {
        purchase_id: purchaseId.toString(),
        product_id: item.product_id,
        quantity: item.quantity,
        rate: item.rate,
      };
    })
  );

  res.status(201).json({
    id: purchaseId.toString(),
    vendor_id,
    invoice_no,
    invoice_date,
    subtotal,
    gst_amount: gstAmount,
    total_amount: totalAmount,
    payment_status: payment_status || 'pending',
    items: purchaseItems,
    created_at: now,
    updated_at: now,
  });
});

export const updatePurchase = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid purchase ID' });
    return;
  }

  const validatedData = purchaseUpdateSchema.parse(req.body);

  const db = getDB();
  const purchasesCollection = db.collection(DB_CONFIG.COLLECTIONS.PURCHASES);

  const purchase = await purchasesCollection.findOne({ _id: new ObjectId(id) });
  if (!purchase) {
    res.status(404).json({ error: 'Purchase not found' });
    return;
  }

  // If items are being updated, recalculate totals
  const updateData: any = { ...validatedData };

  if (validatedData.items) {
    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0
    );
    const gstAmount = subtotal * 0.18;
    const totalAmount = subtotal + gstAmount;

    updateData.subtotal = subtotal;
    updateData.gst_amount = gstAmount;
    updateData.total_amount = totalAmount;
  }

  await purchasesCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updateData, updatedAt: new Date() } }
  );

  const updatedPurchase = await purchasesCollection.findOne({ _id: new ObjectId(id) });

  res.json({
    id: updatedPurchase!._id.toString(),
    vendor_id: updatedPurchase!.vendor_id.toString(),
    invoice_no: updatedPurchase!.invoice_no,
    invoice_date: updatedPurchase!.invoice_date,
    subtotal: updatedPurchase!.subtotal,
    gst_amount: updatedPurchase!.gst_amount,
    total_amount: updatedPurchase!.total_amount,
    payment_status: updatedPurchase!.payment_status,
    created_at: updatedPurchase!.createdAt,
    updated_at: updatedPurchase!.updatedAt,
  });
});

export const updatePurchaseStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { payment_status } = req.body;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid purchase ID' });
      return;
    }

    if (!['pending', 'paid', 'partial'].includes(payment_status)) {
      res.status(400).json({ error: 'Invalid payment status' });
      return;
    }

    const db = getDB();
    const purchasesCollection = db.collection(DB_CONFIG.COLLECTIONS.PURCHASES);

    const purchase = await purchasesCollection.findOne({ _id: new ObjectId(id) });
    if (!purchase) {
      res.status(404).json({ error: 'Purchase not found' });
      return;
    }

    await purchasesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { payment_status, updatedAt: new Date() } }
    );

    res.json({ message: 'Purchase status updated successfully' });
  }
);

