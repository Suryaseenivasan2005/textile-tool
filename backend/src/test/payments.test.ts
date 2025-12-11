import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, getAuthToken, setupTestDB, teardownTestDB } from './helpers';

const app = createTestApp();

describe('Payments API', () => {
  let authToken: string;
  let vendorId: string;
  let customerId: string;

  beforeAll(async () => {
    await setupTestDB();
    authToken = await getAuthToken(app, '1313131313', 'test123');

    // Create vendor and customer for payment tests
    const vendorResponse = await request(app)
      .post('/api/vendors')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Payment Test Vendor', status: 'active' });
    vendorId = vendorResponse.body.id;

    const customerResponse = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Payment Test Customer' });
    customerId = customerResponse.body.id;
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('GET /api/payments', () => {
    it('should get all payments', async () => {
      const response = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by reference type', async () => {
      const response = await request(app)
        .get('/api/payments?reference_type=vendor')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by payment mode', async () => {
      const response = await request(app)
        .get('/api/payments?payment_mode=cash')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/payments');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/payments', () => {
    it('should create a vendor payment', async () => {
      const paymentData = {
        reference_type: 'vendor',
        reference_id: vendorId,
        amount: 1000,
        payment_mode: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
      };

      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.reference_type).toBe('vendor');
      expect(response.body.reference_id).toBe(vendorId);
      expect(response.body.amount).toBe(1000);
      expect(response.body.payment_mode).toBe('cash');
    });

    it('should create a customer payment', async () => {
      const paymentData = {
        reference_type: 'customer',
        reference_id: customerId,
        amount: 500,
        payment_mode: 'bank',
        payment_date: new Date().toISOString().split('T')[0],
      };

      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      expect(response.status).toBe(201);
      expect(response.body.reference_type).toBe('customer');
      expect(response.body.reference_id).toBe(customerId);
      expect(response.body.amount).toBe(500);
    });

    it('should reject payment with invalid vendor', async () => {
      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reference_type: 'vendor',
          reference_id: '507f1f77bcf86cd799439011',
          amount: 1000,
          payment_mode: 'cash',
          payment_date: new Date().toISOString().split('T')[0],
        });

      expect(response.status).toBe(404);
    });

    it('should reject payment with invalid customer', async () => {
      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reference_type: 'customer',
          reference_id: '507f1f77bcf86cd799439011',
          amount: 500,
          payment_mode: 'cash',
          payment_date: new Date().toISOString().split('T')[0],
        });

      expect(response.status).toBe(404);
    });

    it('should reject payment with zero amount', async () => {
      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reference_type: 'vendor',
          reference_id: vendorId,
          amount: 0,
          payment_mode: 'cash',
          payment_date: new Date().toISOString().split('T')[0],
        });

      expect([400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });

    it('should support different payment modes', async () => {
      const modes = ['cash', 'bank', 'cheque', 'online'];

      for (const mode of modes) {
        const response = await request(app)
          .post('/api/payments')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            reference_type: 'vendor',
            reference_id: vendorId,
            amount: 100,
            payment_mode: mode,
            payment_date: new Date().toISOString().split('T')[0],
          });

        expect(response.status).toBe(201);
        expect(response.body.payment_mode).toBe(mode);
      }
    });
  });

  describe('GET /api/payments/ledger/:type/:id', () => {
    let testVendorId: string;
    let testCustomerId: string;
    let purchaseId: string;
    let saleId: string;

    beforeAll(async () => {
      // Create test vendor and customer
      const vendorResponse = await request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Ledger Test Vendor', status: 'active' });
      testVendorId = vendorResponse.body.id;

      const customerResponse = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Ledger Test Customer' });
      testCustomerId = customerResponse.body.id;

      // Create product for transactions
      const productResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Ledger Test Product',
          unit: 'meter',
          cost_price: 100,
          selling_price: 150,
        });
      const productId = productResponse.body.id;

      // Add inventory
      await request(app)
        .post('/api/inventory/adjust')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: productId,
          quantity: 100,
          type: 'in',
        });

      // Create purchase
      const purchaseResponse = await request(app)
        .post('/api/purchases')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          vendor_id: testVendorId,
          invoice_no: 'PUR-LED-001',
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

      // Create sale
      const saleResponse = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customer_id: testCustomerId,
          invoice_no: 'SAL-LED-001',
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

      // Create payments
      await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reference_type: 'vendor',
          reference_id: testVendorId,
          amount: 500,
          payment_mode: 'cash',
          payment_date: new Date().toISOString().split('T')[0],
        });

      await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reference_type: 'customer',
          reference_id: testCustomerId,
          amount: 300,
          payment_mode: 'cash',
          payment_date: new Date().toISOString().split('T')[0],
        });
    });

    it('should get vendor ledger', async () => {
      const response = await request(app)
        .get(`/api/payments/ledger/vendor/${testVendorId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.type).toBe('vendor');
      expect(response.body.reference_id).toBe(testVendorId);
      expect(response.body).toHaveProperty('entries');
      expect(Array.isArray(response.body.entries)).toBe(true);
      expect(response.body).toHaveProperty('current_balance');

      // Verify entries structure
      if (response.body.entries.length > 0) {
        const entry = response.body.entries[0];
        expect(entry).toHaveProperty('date');
        expect(entry).toHaveProperty('type');
        expect(entry).toHaveProperty('description');
        expect(entry).toHaveProperty('debit');
        expect(entry).toHaveProperty('credit');
        expect(entry).toHaveProperty('balance');
      }
    });

    it('should get customer ledger', async () => {
      const response = await request(app)
        .get(`/api/payments/ledger/customer/${testCustomerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.type).toBe('customer');
      expect(response.body.reference_id).toBe(testCustomerId);
      expect(response.body).toHaveProperty('entries');
      expect(response.body).toHaveProperty('current_balance');
    });

    it('should calculate vendor ledger balance correctly', async () => {
      const response = await request(app)
        .get(`/api/payments/ledger/vendor/${testVendorId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Calculate expected balance
      // Purchase: debit (increases balance)
      // Payment: credit (decreases balance)
      let expectedBalance = 0;
      response.body.entries.forEach((entry: any) => {
        expectedBalance = expectedBalance + entry.debit - entry.credit;
      });

      expect(response.body.current_balance).toBe(expectedBalance);
    });

    it('should calculate customer ledger balance correctly', async () => {
      const response = await request(app)
        .get(`/api/payments/ledger/customer/${testCustomerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Calculate expected balance
      // Sale: credit (increases balance)
      // Payment: debit (decreases balance)
      let expectedBalance = 0;
      response.body.entries.forEach((entry: any) => {
        expectedBalance = expectedBalance + entry.debit - entry.credit;
      });

      expect(response.body.current_balance).toBe(expectedBalance);
    });

    it('should sort ledger entries by date', async () => {
      const response = await request(app)
        .get(`/api/payments/ledger/vendor/${testVendorId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      if (response.body.entries.length > 1) {
        for (let i = 1; i < response.body.entries.length; i++) {
          const prevDate = new Date(response.body.entries[i - 1].date).getTime();
          const currDate = new Date(response.body.entries[i].date).getTime();
          expect(currDate).toBeGreaterThanOrEqual(prevDate);
        }
      }
    });

    it('should include purchase entries in vendor ledger', async () => {
      const response = await request(app)
        .get(`/api/payments/ledger/vendor/${testVendorId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      const purchaseEntries = response.body.entries.filter(
        (e: any) => e.type === 'purchase'
      );
      expect(purchaseEntries.length).toBeGreaterThan(0);

      // Verify purchase entry structure
      const purchaseEntry = purchaseEntries[0];
      expect(purchaseEntry.debit).toBeGreaterThan(0);
      expect(purchaseEntry.credit).toBe(0);
      expect(purchaseEntry.description).toContain('Purchase Invoice');
    });

    it('should include sale entries in customer ledger', async () => {
      const response = await request(app)
        .get(`/api/payments/ledger/customer/${testCustomerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      const saleEntries = response.body.entries.filter((e: any) => e.type === 'sale');
      expect(saleEntries.length).toBeGreaterThan(0);

      // Verify sale entry structure
      const saleEntry = saleEntries[0];
      expect(saleEntry.credit).toBeGreaterThan(0);
      expect(saleEntry.debit).toBe(0);
      expect(saleEntry.description).toContain('Sale Invoice');
    });

    it('should include payment entries in vendor ledger', async () => {
      const response = await request(app)
        .get(`/api/payments/ledger/vendor/${testVendorId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      const paymentEntries = response.body.entries.filter(
        (e: any) => e.type === 'payment'
      );
      expect(paymentEntries.length).toBeGreaterThan(0);

      // For vendor: payment is credit (reduces balance)
      const paymentEntry = paymentEntries[0];
      expect(paymentEntry.credit).toBeGreaterThan(0);
      expect(paymentEntry.debit).toBe(0);
    });

    it('should include payment entries in customer ledger', async () => {
      const response = await request(app)
        .get(`/api/payments/ledger/customer/${testCustomerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      const paymentEntries = response.body.entries.filter(
        (e: any) => e.type === 'payment'
      );
      expect(paymentEntries.length).toBeGreaterThan(0);

      // For customer: payment is debit (reduces balance)
      const paymentEntry = paymentEntries[0];
      expect(paymentEntry.debit).toBeGreaterThan(0);
      expect(paymentEntry.credit).toBe(0);
    });

    it('should reject invalid ledger type', async () => {
      const response = await request(app)
        .get(`/api/payments/ledger/invalid/${testVendorId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should reject invalid ID', async () => {
      const response = await request(app)
        .get('/api/payments/ledger/vendor/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/payments/ledger/vendor/${testVendorId}`);

      expect(response.status).toBe(401);
    });
  });
});

