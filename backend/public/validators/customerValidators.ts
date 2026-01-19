import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  gst_number: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const customerUpdateSchema = customerSchema.partial();

