import { Request, Response } from 'express';
import { getDB } from '../config/database';
import { DB_CONFIG, DEMO_USER_ID } from '../constants';
import { asyncHandler } from '../middleware/asyncHandler';
import { generateToken } from '../utils/jwt';
import { ObjectId } from 'mongodb';

const clearDemoData = async () => {
  const db = getDB();
  const collections = Object.values(DB_CONFIG.COLLECTIONS);
  for (const collectionName of collections) {
    if (collectionName !== DB_CONFIG.COLLECTIONS.USERS) {
      await db.collection(collectionName).deleteMany({ is_demo: true });
    }
  }
};

const seedDemoData = async () => {
  const db = getDB();
  const now = new Date();

  // Helper to make a date N days ago
  const daysAgo = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  };

  // --- 0. Settings ---
  const demoSettings = {
    business_name: 'Demo Textile Traders',
    business_address: '123 Fashion Street, Silk District\nMumbai, Maharashtra 400001',
    business_phone: '9876543210',
    business_email: 'hello@demotextiles.com',
    gst_number: '27AADCD1234E1Z5',
    tax_rate: 5,
    invoice_prefix: 'DEMO',
    is_demo: true,
  };
  
  await db.collection(DB_CONFIG.COLLECTIONS.SETTINGS).insertOne(demoSettings);

  // --- 1. Vendors ---
  const vendorDocs = [
    { name: 'Textile Mills Ltd', gst_number: '27AABCU9603R1ZJ', phone: '9876543210', address: 'Bhiwandi, Maharashtra', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Silk Route Fabrics', gst_number: '29BBDCU9603R1ZK', phone: '9812345678', address: 'Mysore, Karnataka', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Cotton King Exports', gst_number: '33CCDCU9603R1ZL', phone: '9498765432', address: 'Coimbatore, Tamil Nadu', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Polyester Palace', gst_number: '24DDDCU9603R1ZM', phone: '9898989898', address: 'Surat, Gujarat', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Linen Heritage Co.', gst_number: '09EEECU9603R1ZN', phone: '9911223344', address: 'Lucknow, Uttar Pradesh', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
  ];
  const vendorRes = await db.collection(DB_CONFIG.COLLECTIONS.VENDORS).insertMany(vendorDocs);
  const vendorIds = Object.values(vendorRes.insertedIds);

  // --- 2. Customers ---
  const customerDocs = [
    { name: 'Rajesh Garments', gst_number: '33RAJCU9603R1ZA', phone: '9123456780', address: 'T. Nagar, Chennai', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Priya Fashion House', gst_number: '07PRIYU9603R1ZB', phone: '9845671234', address: 'Karol Bagh, Delhi', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Metro Tailors', gst_number: '36METCU9603R1ZC', phone: '9701234567', address: 'Begumpet, Hyderabad', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Royal Boutiques', gst_number: '19ROYCU9603R1ZD', phone: '9830012345', address: 'Park Street, Kolkata', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Modern Wear Studio', gst_number: '27MODCU9603R1ZE', phone: '9890123456', address: 'FC Road, Pune', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Sunrise Exports', gst_number: '24SUNCU9603R1ZF', phone: '9925634781', address: 'Ring Road, Ahmedabad', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
  ];
  const customerRes = await db.collection(DB_CONFIG.COLLECTIONS.CUSTOMERS).insertMany(customerDocs);
  const customerIds = Object.values(customerRes.insertedIds);

  // --- 3. Categories ---
  const categoryDocs = [
    { name: 'Cotton', description: 'Pure and blended cotton fabrics', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Silk', description: 'Premium natural silk varieties', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Polyester', description: 'Durable synthetic blends', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Linen', description: 'Natural linen and blends', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Denim', description: 'Denim and jean fabric', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
  ];
  await db.collection(DB_CONFIG.COLLECTIONS.CATEGORIES).insertMany(categoryDocs);

  // --- 4. Colors ---
  const colorDocs = [
    { name: 'Ivory White', hex_code: '#FFFFF0', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Navy Blue', hex_code: '#001F5B', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Crimson Red', hex_code: '#DC143C', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Jet Black', hex_code: '#0A0A0A', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Sage Green', hex_code: '#8FAF7E', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Mustard Yellow', hex_code: '#E1AD01', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Blush Pink', hex_code: '#FFB6C1', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Charcoal Grey', hex_code: '#36454F', status: 'active', is_demo: true, createdAt: now, updatedAt: now },
  ];
  await db.collection(DB_CONFIG.COLLECTIONS.COLORS).insertMany(colorDocs);

  // --- 5. Products (with cost_price + selling_price) ---
  const productDocs = [
    { name: 'Premium Cotton Roll', category: 'Cotton', color: 'Ivory White', design: 'Plain', unit: 'meter', cost_price: 85, selling_price: 120, reorder_level: 50, status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Mysore Silk Saree', category: 'Silk', color: 'Crimson Red', design: 'Brocade', unit: 'piece', cost_price: 1800, selling_price: 2800, reorder_level: 10, status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Polyester Blend 40s', category: 'Polyester', color: 'Navy Blue', design: 'Striped', unit: 'kg', cost_price: 145, selling_price: 195, reorder_level: 100, status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Belgian Linen Shirting', category: 'Linen', color: 'Charcoal Grey', design: 'Herringbone', unit: 'meter', cost_price: 280, selling_price: 420, reorder_level: 30, status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Raw Denim 12oz', category: 'Denim', color: 'Jet Black', design: 'Selvedge', unit: 'meter', cost_price: 320, selling_price: 480, reorder_level: 40, status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Chanderi Silk Blend', category: 'Silk', color: 'Mustard Yellow', design: 'Zari Border', unit: 'meter', cost_price: 550, selling_price: 850, reorder_level: 15, status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Organic Cotton Cambric', category: 'Cotton', color: 'Blush Pink', design: 'Floral Print', unit: 'meter', cost_price: 110, selling_price: 165, reorder_level: 60, status: 'active', is_demo: true, createdAt: now, updatedAt: now },
    { name: 'Viscose Georgette', category: 'Polyester', color: 'Sage Green', design: 'Solid', unit: 'meter', cost_price: 195, selling_price: 280, reorder_level: 35, status: 'active', is_demo: true, createdAt: now, updatedAt: now },
  ];
  const productRes = await db.collection(DB_CONFIG.COLLECTIONS.PRODUCTS).insertMany(productDocs);
  const productIds = Object.values(productRes.insertedIds);

  // --- 6. Initialize inventory for all products ---
  const inventoryDocs = productIds.map((pid, i) => ({
    product_id: pid,
    quantity_available: [500, 80, 800, 250, 180, 120, 420, 300][i] || 200,
    is_demo: true,
    createdAt: now,
    updatedAt: now,
  }));
  await db.collection(DB_CONFIG.COLLECTIONS.INVENTORY).insertMany(inventoryDocs);

  // --- 7. Purchases ---
  const purchaseDatas = [
    { vIdx: 0, days: 35, inv: 'PUR-2024-001', items: [{ pIdx: 0, qty: 200, rate: 85 }, { pIdx: 6, qty: 150, rate: 110 }], status: 'paid' },
    { vIdx: 1, days: 28, inv: 'PUR-2024-002', items: [{ pIdx: 1, qty: 40, rate: 1800 }, { pIdx: 5, qty: 60, rate: 550 }], status: 'paid' },
    { vIdx: 2, days: 20, inv: 'PUR-2024-003', items: [{ pIdx: 2, qty: 300, rate: 145 }], status: 'partial' },
    { vIdx: 3, days: 14, inv: 'PUR-2024-004', items: [{ pIdx: 4, qty: 80, rate: 320 }, { pIdx: 7, qty: 120, rate: 195 }], status: 'paid' },
    { vIdx: 4, days: 7,  inv: 'PUR-2024-005', items: [{ pIdx: 3, qty: 100, rate: 280 }], status: 'pending' },
    { vIdx: 0, days: 3,  inv: 'PUR-2024-006', items: [{ pIdx: 0, qty: 100, rate: 83 }, { pIdx: 6, qty: 80, rate: 108 }], status: 'pending' },
  ];

  for (const pd of purchaseDatas) {
    const subtotal = pd.items.reduce((s, i) => s + i.qty * i.rate, 0);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;
    const purchaseDoc = {
      vendor_id: vendorIds[pd.vIdx],
      invoice_no: pd.inv,
      invoice_date: daysAgo(pd.days),
      subtotal,
      gst_amount: gst,
      total_amount: total,
      payment_status: pd.status,
      is_demo: true,
      createdAt: now,
      updatedAt: now,
    };
    const pRes = await db.collection(DB_CONFIG.COLLECTIONS.PURCHASES).insertOne(purchaseDoc);
    const purchaseId = pRes.insertedId;
    for (const item of pd.items) {
      await db.collection(DB_CONFIG.COLLECTIONS.PURCHASE_ITEMS).insertOne({
        purchase_id: purchaseId,
        product_id: productIds[item.pIdx],
        quantity: item.qty,
        rate: item.rate,
        is_demo: true,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  // --- 8. Sales ---
  const saleDatas = [
    { cIdx: 0, days: 30, inv: 'SAL-2024-001', items: [{ pIdx: 0, qty: 80, rate: 120 }, { pIdx: 6, qty: 50, rate: 165 }], discount: 5, payment_type: 'cash' },
    { cIdx: 1, days: 25, inv: 'SAL-2024-002', items: [{ pIdx: 1, qty: 15, rate: 2800 }], discount: 0, payment_type: 'bank' },
    { cIdx: 2, days: 18, inv: 'SAL-2024-003', items: [{ pIdx: 2, qty: 120, rate: 195 }, { pIdx: 7, qty: 60, rate: 280 }], discount: 3, payment_type: 'credit' },
    { cIdx: 3, days: 12, inv: 'SAL-2024-004', items: [{ pIdx: 4, qty: 30, rate: 480 }, { pIdx: 3, qty: 40, rate: 420 }], discount: 0, payment_type: 'cheque' },
    { cIdx: 4, days: 8,  inv: 'SAL-2024-005', items: [{ pIdx: 5, qty: 25, rate: 850 }], discount: 10, payment_type: 'bank' },
    { cIdx: 5, days: 5,  inv: 'SAL-2024-006', items: [{ pIdx: 0, qty: 50, rate: 122 }, { pIdx: 6, qty: 30, rate: 168 }], discount: 0, payment_type: 'cash' },
    { cIdx: 0, days: 2,  inv: 'SAL-2024-007', items: [{ pIdx: 7, qty: 45, rate: 285 }], discount: 5, payment_type: 'online' },
  ];

  for (const sd of saleDatas) {
    const subtotal = sd.items.reduce((s, i) => s + i.qty * i.rate, 0);
    const discAmt = (subtotal * sd.discount) / 100;
    const afterDisc = subtotal - discAmt;
    const gst = afterDisc * 0.18;
    const total = afterDisc + gst;
    const saleDoc = {
      customer_id: customerIds[sd.cIdx],
      invoice_no: sd.inv,
      invoice_date: daysAgo(sd.days),
      subtotal,
      gst_amount: gst,
      discount: sd.discount,
      total_amount: total,
      payment_type: sd.payment_type,
      is_demo: true,
      createdAt: now,
      updatedAt: now,
    };
    const sRes = await db.collection(DB_CONFIG.COLLECTIONS.SALES).insertOne(saleDoc);
    const saleId = sRes.insertedId;
    for (const item of sd.items) {
      await db.collection(DB_CONFIG.COLLECTIONS.SALE_ITEMS).insertOne({
        sale_id: saleId,
        product_id: productIds[item.pIdx],
        quantity: item.qty,
        rate: item.rate,
        is_demo: true,
        createdAt: now,
        updatedAt: now,
      });
      // Reduce inventory
      await db.collection(DB_CONFIG.COLLECTIONS.INVENTORY).updateOne(
        { product_id: productIds[item.pIdx], is_demo: true },
        { $inc: { quantity_available: -item.qty }, $set: { updatedAt: now } }
      );
    }
  }

  // --- 9. Returns ---
  // Get first purchase and sale IDs to reference
  const firstPurchase = await db.collection(DB_CONFIG.COLLECTIONS.PURCHASES).findOne({ is_demo: true, invoice_no: 'PUR-2024-001' });
  const firstSale = await db.collection(DB_CONFIG.COLLECTIONS.SALES).findOne({ is_demo: true, invoice_no: 'SAL-2024-002' });

  if (firstPurchase) {
    const retDoc = {
      type: 'purchase',
      reference_invoice_id: firstPurchase._id,
      date: daysAgo(29),
      total_amount: 85 * 10,
      is_demo: true,
      createdAt: now,
      updatedAt: now,
    };
    const retRes = await db.collection(DB_CONFIG.COLLECTIONS.RETURNS).insertOne(retDoc);
    await db.collection(DB_CONFIG.COLLECTIONS.RETURN_ITEMS).insertOne({
      return_id: retRes.insertedId,
      product_id: productIds[0],
      quantity: 10,
      is_demo: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  if (firstSale) {
    const retDoc2 = {
      type: 'sales',
      reference_invoice_id: firstSale._id,
      date: daysAgo(22),
      total_amount: 2800 * 2,
      is_demo: true,
      createdAt: now,
      updatedAt: now,
    };
    const retRes2 = await db.collection(DB_CONFIG.COLLECTIONS.RETURNS).insertOne(retDoc2);
    await db.collection(DB_CONFIG.COLLECTIONS.RETURN_ITEMS).insertOne({
      return_id: retRes2.insertedId,
      product_id: productIds[1],
      quantity: 2,
      is_demo: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  // --- 10. Payments ---
  // Get purchase/sale docs for references
  const allPurchases = await db.collection(DB_CONFIG.COLLECTIONS.PURCHASES).find({ is_demo: true }).toArray();
  const allSales = await db.collection(DB_CONFIG.COLLECTIONS.SALES).find({ is_demo: true }).toArray();

  const paymentDocs: any[] = [];
  // Vendor payments (for paid purchases)
  for (const pur of allPurchases.filter(p => p.payment_status === 'paid')) {
    paymentDocs.push({
      reference_type: 'vendor',
      reference_id: pur.vendor_id,
      amount: pur.total_amount,
      payment_mode: ['cash', 'bank', 'cheque'][Math.floor(Math.random() * 3)],
      payment_date: pur.invoice_date,
      is_demo: true,
      createdAt: now,
      updatedAt: now,
    });
  }
  // Partial payment
  const partialPur = allPurchases.find(p => p.payment_status === 'partial');
  if (partialPur) {
    paymentDocs.push({
      reference_type: 'vendor',
      reference_id: partialPur.vendor_id,
      amount: Math.round(partialPur.total_amount * 0.5),
      payment_mode: 'bank',
      payment_date: partialPur.invoice_date,
      is_demo: true,
      createdAt: now,
      updatedAt: now,
    });
  }
  // Customer receipts for cash/bank sales
  for (const sal of allSales.filter(s => s.payment_type !== 'credit')) {
    paymentDocs.push({
      reference_type: 'customer',
      reference_id: sal.customer_id,
      amount: sal.total_amount,
      payment_mode: sal.payment_type === 'online' ? 'bank' : sal.payment_type,
      payment_date: sal.invoice_date,
      is_demo: true,
      createdAt: now,
      updatedAt: now,
    });
  }
  if (paymentDocs.length > 0) {
    await db.collection(DB_CONFIG.COLLECTIONS.PAYMENTS).insertMany(paymentDocs);
  }
};

export const startDemo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await clearDemoData();
  await seedDemoData();
  const token = generateToken({ userId: DEMO_USER_ID, mobile: '0000000000' });
  res.json({
    message: 'Demo started successfully',
    token,
    user: { id: DEMO_USER_ID, name: 'Demo User', mobile: '0000000000' },
  });
});

export const resetDemo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await clearDemoData();
  await seedDemoData();
  res.json({ message: 'Demo data reset successfully' });
});

export const getDemoStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.json({ active: true, message: 'Demo mode is available' });
});
