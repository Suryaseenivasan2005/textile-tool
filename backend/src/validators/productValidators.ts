import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().optional(),
  color: z.string().optional(),
  design: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  cost_price: z.number().min(0, 'Cost price must be non-negative'),
  selling_price: z.number().min(0, 'Selling price must be non-negative'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const productUpdateSchema = productSchema.partial();

