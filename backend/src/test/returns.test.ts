import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, getAuthToken, setupTestDB, teardownTestDB } from './helpers';

const app = createTestApp();

describe('Returns API', () => {
  let authToken: string;
  let vendorId: string;
  let customerId: string;
  let productId: string;
  let purchaseId: string;
  let saleId: string;

  beforeAll(async () => {
    await setupTestDB();
    authToken = await getAuthToken(app, '1212121212', 'test123');

    // Create vendor and product for purchase
    const vendorResponse = await request(app)
      .post('/api/vendors')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Return Test Vendor', status: 'active' });
    vendorId = vendorResponse.body.id;

    const productResponse = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Return Test Product',
        unit: 'meter',
        cost_price: 100,
        selling_price: 150,
      });
    productId = productResponse.body.id;

    // Add inventory
    await request(app)
      .post('/api/inventory/adjust')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        product_id: productId,
        quantity: 100,
        type: 'in',
      });

    // Create customer
    const customerResponse = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Return Test Customer' });
    customerId = customerResponse.body.id;

    // Create a purchase for purchase return test
    const purchaseResponse = await request(app)
      .post('/api/purchases')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        vendor_id: vendorId,
        invoice_no: 'PUR-RET-001',
        invoice_date: new Date().toISOString().split('T')[0],
        items: [
          {
            product_id: productId,
            quantity: 10,
            rate: 100,
          },
        ],
      });
    purchaseId = purchaseResponse.body.id;

    // Create a sale for sales return test
    const saleResponse = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        customer_id: customerId,
        invoice_no: 'SAL-RET-001',
        invoice_date: new Date().toISOString().split('T')[0],
        items: [
          {
            product_id: productId,
            quantity: 5,
            rate: 150,
          },
        ],
        payment_type: 'cash',
      });
    saleId = saleResponse.body.id;
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('GET /api/returns', () => {
    it('should get all returns', async () => {
      const response = await request(app)
        .get('/api/returns')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get('/api/returns?type=sales')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/returns');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/returns', () => {
    it('should create a sales return', async () => {
      // Get initial inventory
      const initialInventory = await request(app)
        .get(`/api/inventory?product_id=${productId}`)
        .set('Authorization', `Bearer ${authToken}`);
      const initialQty = initialInventory.body[0]?.quantity_available || 0;

      const returnData = {
        type: 'sales',
        reference_invoice_id: saleId,
        date: new Date().toISOString().split('T')[0],
        items: [
          {
            product_id: productId,
            quantity: 2,
          },
        ],
      };

      const response = await request(app)
        .post('/api/returns')
        .set('Authorization', `Bearer ${authToken}`)
        .send(returnData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe('sales');
      expect(response.body.reference_invoice_id).toBe(saleId);
      expect(response.body).toHaveProperty('total_amount');
      expect(response.body.items).toHaveLength(1);

      // Verify inventory increased (sales return adds stock back)
      const updatedInventory = await request(app)
        .get(`/api/inventory?product_id=${productId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(updatedInventory.body[0].quantity_available).toBe(initialQty + 2);
    });

    it('should create a purchase return', async () => {
      // Get initial inventory
      const initialInventory = await request(app)
        .get(`/api/inventory?product_id=${productId}`)
        .set('Authorization', `Bearer ${authToken}`);
      const initialQty = initialInventory.body[0]?.quantity_available || 0;

      const returnData = {
        type: 'purchase',
        reference_invoice_id: purchaseId,
        date: new Date().toISOString().split('T')[0],
        items: [
          {
            product_id: productId,
            quantity: 3,
          },
        ],
      };

      const response = await request(app)
        .post('/api/returns')
        .set('Authorization', `Bearer ${authToken}`)
        .send(returnData);

      expect(response.status).toBe(201);
      expect(response.body.type).toBe('purchase');
      expect(response.body.reference_invoice_id).toBe(purchaseId);

      // Verify inventory decreased (purchase return removes stock)
      const updatedInventory = await request(app)
        .get(`/api/inventory?product_id=${productId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(updatedInventory.body[0].quantity_available).toBe(initialQty - 3);
    });

    it('should reject return without items', async () => {
      const response = await request(app)
        .post('/api/returns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'sales',
          reference_invoice_id: saleId,
          date: new Date().toISOString().split('T')[0],
          items: [],
        });

      expect([400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject return with invalid reference invoice', async () => {
      const response = await request(app)
        .post('/api/returns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'sales',
          reference_invoice_id: '507f1f77bcf86cd799439011',
          date: new Date().toISOString().split('T')[0],
          items: [
            {
              product_id: productId,
              quantity: 1,
            },
          ],
        });

      expect(response.status).toBe(404);
    });

    it('should reject return with invalid product', async () => {
      const response = await request(app)
        .post('/api/returns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'sales',
          reference_invoice_id: saleId,
          date: new Date().toISOString().split('T')[0],
          items: [
            {
              product_id: '507f1f77bcf86cd799439011',
              quantity: 1,
            },
          ],
        });

      expect(response.status).toBe(404);
    });

    it('should calculate total amount correctly', async () => {
      const returnData = {
        type: 'sales',
        reference_invoice_id: saleId,
        date: new Date().toISOString().split('T')[0],
        items: [
          {
            product_id: productId,
            quantity: 1,
          },
        ],
      };

      const response = await request(app)
        .post('/api/returns')
        .set('Authorization', `Bearer ${authToken}`)
        .send(returnData);

      expect(response.status).toBe(201);
      // Total should be quantity * cost_price (100)
      expect(response.body.total_amount).toBe(100);
    });
  });

  describe('GET /api/returns/:id', () => {
    let returnId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/returns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'sales',
          reference_invoice_id: saleId,
          date: new Date().toISOString().split('T')[0],
          items: [
            {
              product_id: productId,
              quantity: 1,
            },
          ],
        });
      returnId = response.body.id;
    });

    it('should get a return by id with items', async () => {
      const response = await request(app)
        .get(`/api/returns/${returnId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(returnId);
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent return', async () => {
      const response = await request(app)
        .get('/api/returns/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});

