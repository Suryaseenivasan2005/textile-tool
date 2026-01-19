import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, getAuthToken, setupTestDB, teardownTestDB } from './helpers';

const app = createTestApp();

describe('Purchases API', () => {
  let authToken: string;
  let vendorId: string;
  let productId: string;

  beforeAll(async () => {
    await setupTestDB();
    authToken = await getAuthToken(app, '4444444444', 'test123');

    // Create vendor and product for purchase tests
    const vendorResponse = await request(app)
      .post('/api/vendors')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Purchase Test Vendor', status: 'active' });
    vendorId = vendorResponse.body.id;

    const productResponse = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Purchase Test Product',
        unit: 'meter',
        cost_price: 100,
        selling_price: 150,
      });
    productId = productResponse.body.id;
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('POST /api/purchases', () => {
    it('should create a new purchase', async () => {
      const purchaseData = {
        vendor_id: vendorId,
        invoice_no: 'PUR-001',
        invoice_date: new Date().toISOString().split('T')[0],
        items: [
          {
            product_id: productId,
            quantity: 10,
            rate: 100,
          },
        ],
        payment_status: 'pending',
      };

      const response = await request(app)
        .post('/api/purchases')
        .set('Authorization', `Bearer ${authToken}`)
        .send(purchaseData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.vendor_id).toBe(vendorId);
      expect(response.body.invoice_no).toBe('PUR-001');
      expect(response.body).toHaveProperty('subtotal');
      expect(response.body).toHaveProperty('gst_amount');
      expect(response.body).toHaveProperty('total_amount');
      expect(response.body.items).toHaveLength(1);
    });

    it('should calculate GST correctly (18%)', async () => {
      const purchaseData = {
        vendor_id: vendorId,
        invoice_no: 'PUR-002',
        invoice_date: new Date().toISOString().split('T')[0],
        items: [
          {
            product_id: productId,
            quantity: 10,
            rate: 100,
          },
        ],
      };

      const response = await request(app)
        .post('/api/purchases')
        .set('Authorization', `Bearer ${authToken}`)
        .send(purchaseData);

      expect(response.status).toBe(201);
      const expectedSubtotal = 1000; // 10 * 100
      const expectedGST = expectedSubtotal * 0.18;
      const expectedTotal = expectedSubtotal + expectedGST;

      expect(response.body.subtotal).toBe(expectedSubtotal);
      expect(response.body.gst_amount).toBe(expectedGST);
      expect(response.body.total_amount).toBe(expectedTotal);
    });

    it('should update inventory after purchase', async () => {
      const purchaseData = {
        vendor_id: vendorId,
        invoice_no: 'PUR-003',
        invoice_date: new Date().toISOString().split('T')[0],
        items: [
          {
            product_id: productId,
            quantity: 5,
            rate: 100,
          },
        ],
      };

      // Get initial inventory
      const initialInventory = await request(app)
        .get(`/api/inventory?product_id=${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const initialQty = initialInventory.body[0]?.quantity_available || 0;

      // Create purchase
      await request(app)
        .post('/api/purchases')
        .set('Authorization', `Bearer ${authToken}`)
        .send(purchaseData);

      // Check inventory increased
      const updatedInventory = await request(app)
        .get(`/api/inventory?product_id=${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(updatedInventory.body[0].quantity_available).toBe(initialQty + 5);
    });

    it('should reject purchase without items', async () => {
      const response = await request(app)
        .post('/api/purchases')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          vendor_id: vendorId,
          invoice_no: 'PUR-004',
          invoice_date: new Date().toISOString().split('T')[0],
          items: [],
        });

      expect(response.status).toBe(400);
    });

    it('should reject purchase with invalid vendor', async () => {
      const response = await request(app)
        .post('/api/purchases')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          vendor_id: '507f1f77bcf86cd799439011',
          invoice_no: 'PUR-005',
          invoice_date: new Date().toISOString().split('T')[0],
          items: [
            {
              product_id: productId,
              quantity: 10,
              rate: 100,
            },
          ],
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/purchases', () => {
    it('should get all purchases', async () => {
      const response = await request(app)
        .get('/api/purchases')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by vendor', async () => {
      const response = await request(app)
        .get(`/api/purchases?vendor_id=${vendorId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by payment status', async () => {
      const response = await request(app)
        .get('/api/purchases?payment_status=pending')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/purchases/:id', () => {
    let purchaseId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/purchases')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          vendor_id: vendorId,
          invoice_no: 'PUR-GET-001',
          invoice_date: new Date().toISOString().split('T')[0],
          items: [
            {
              product_id: productId,
              quantity: 10,
              rate: 100,
            },
          ],
        });
      purchaseId = response.body.id;
    });

    it('should get a purchase by id with items', async () => {
      const response = await request(app)
        .get(`/api/purchases/${purchaseId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(purchaseId);
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items.length).toBeGreaterThan(0);
    });
  });

  describe('PATCH /api/purchases/:id/status', () => {
    let purchaseId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/purchases')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          vendor_id: vendorId,
          invoice_no: 'PUR-STATUS-001',
          invoice_date: new Date().toISOString().split('T')[0],
          items: [
            {
              product_id: productId,
              quantity: 10,
              rate: 100,
            },
          ],
        });
      purchaseId = response.body.id;
    });

    it('should update payment status', async () => {
      const response = await request(app)
        .patch(`/api/purchases/${purchaseId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ payment_status: 'paid' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verify status updated
      const getResponse = await request(app)
        .get(`/api/purchases/${purchaseId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.body.payment_status).toBe('paid');
    });

    it('should reject invalid payment status', async () => {
      const response = await request(app)
        .patch(`/api/purchases/${purchaseId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ payment_status: 'invalid' });

      expect(response.status).toBe(400);
    });
  });
});

