import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, getAuthToken, setupTestDB, teardownTestDB } from './helpers';

const app = createTestApp();

describe('Sales API', () => {
  let authToken: string;
  let customerId: string;
  let productId: string;

  beforeAll(async () => {
    await setupTestDB();
    authToken = await getAuthToken(app, '5555555555', 'test123');

    // Create customer and product for sale tests
    const customerResponse = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Sale Test Customer' });
    customerId = customerResponse.body.id;

    // Create product with inventory
    const productResponse = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Sale Test Product',
        unit: 'meter',
        cost_price: 100,
        selling_price: 150,
      });
    productId = productResponse.body.id;

    // Add inventory for the product
    await request(app)
      .post('/api/inventory/adjust')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        product_id: productId,
        quantity: 100,
        type: 'in',
      });
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('POST /api/sales', () => {
    it('should create a new sale', async () => {
      const saleData = {
        customer_id: customerId,
        invoice_no: 'SAL-001',
        invoice_date: new Date().toISOString().split('T')[0],
        items: [
          {
            product_id: productId,
            quantity: 5,
            rate: 150,
          },
        ],
        discount: 0,
        payment_type: 'cash',
      };

      const response = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(saleData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.invoice_no).toBe('SAL-001');
      expect(response.body).toHaveProperty('subtotal');
      expect(response.body).toHaveProperty('gst_amount');
      expect(response.body).toHaveProperty('total_amount');
    });

    it('should calculate discount correctly', async () => {
      const saleData = {
        customer_id: customerId,
        invoice_no: 'SAL-002',
        invoice_date: new Date().toISOString().split('T')[0],
        items: [
          {
            product_id: productId,
            quantity: 10,
            rate: 150,
          },
        ],
        discount: 10, // 10% discount
        payment_type: 'cash',
      };

      const response = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(saleData);

      expect(response.status).toBe(201);
      const subtotal = 1500; // 10 * 150
      const discountAmount = subtotal * 0.1;
      const subtotalAfterDiscount = subtotal - discountAmount;
      const gst = subtotalAfterDiscount * 0.18;
      const total = subtotalAfterDiscount + gst;

      expect(response.body.subtotal).toBe(subtotal);
      expect(response.body.discount).toBe(10);
      expect(response.body.total_amount).toBe(total);
    });

    it('should update inventory after sale', async () => {
      // Get initial inventory
      const initialInventory = await request(app)
        .get(`/api/inventory?product_id=${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const initialQty = initialInventory.body[0]?.quantity_available || 0;

      // Create sale
      await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customer_id: customerId,
          invoice_no: 'SAL-003',
          invoice_date: new Date().toISOString().split('T')[0],
          items: [
            {
              product_id: productId,
              quantity: 3,
              rate: 150,
            },
          ],
          payment_type: 'cash',
        });

      // Check inventory decreased
      const updatedInventory = await request(app)
        .get(`/api/inventory?product_id=${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(updatedInventory.body[0].quantity_available).toBe(initialQty - 3);
    });

    it('should reject sale with insufficient inventory', async () => {
      const response = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customer_id: customerId,
          invoice_no: 'SAL-004',
          invoice_date: new Date().toISOString().split('T')[0],
          items: [
            {
              product_id: productId,
              quantity: 999999, // Very large quantity
              rate: 150,
            },
          ],
          payment_type: 'cash',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should allow sale without customer (walk-in)', async () => {
      const response = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invoice_no: 'SAL-005',
          invoice_date: new Date().toISOString().split('T')[0],
          items: [
            {
              product_id: productId,
              quantity: 1,
              rate: 150,
            },
          ],
          payment_type: 'cash',
        });

      expect(response.status).toBe(201);
      expect(response.body.customer_id).toBeNull();
    });
  });

  describe('GET /api/sales', () => {
    it('should get all sales', async () => {
      const response = await request(app)
        .get('/api/sales')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by customer', async () => {
      const response = await request(app)
        .get(`/api/sales?customer_id=${customerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/sales/:id', () => {
    let saleId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customer_id: customerId,
          invoice_no: 'SAL-GET-001',
          invoice_date: new Date().toISOString().split('T')[0],
          items: [
            {
              product_id: productId,
              quantity: 2,
              rate: 150,
            },
          ],
          payment_type: 'cash',
        });
      saleId = response.body.id;
    });

    it('should get a sale by id with items', async () => {
      const response = await request(app)
        .get(`/api/sales/${saleId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(saleId);
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
    });
  });
});

