import { z } from 'zod';

export const returnItemSchema = z.object({
  product_id: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
});

export const returnSchema = z.object({
  type: z.enum(['sales', 'purchase']),
  reference_invoice_id: z.string().min(1, 'Reference invoice ID is required'),
  date: z.string().min(1, 'Date is required'),
  items: z.array(returnItemSchema).min(1, 'At least one item is required'),
});

