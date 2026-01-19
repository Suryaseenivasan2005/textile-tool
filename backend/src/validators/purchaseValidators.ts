import { z } from 'zod';

export const purchaseItemSchema = z.object({
  product_id: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  rate: z.number().min(0, 'Rate must be non-negative'),
});

export const purchaseSchema = z.object({
  vendor_id: z.string().min(1, 'Vendor ID is required'),
  invoice_no: z.string().min(1, 'Invoice number is required'),
  invoice_date: z.string().min(1, 'Invoice date is required'),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
  payment_status: z.enum(['pending', 'paid', 'partial']).default('pending'),
});

export const purchaseUpdateSchema = purchaseSchema.partial();

