import { z } from 'zod';

export const colorSchema = z.object({
  name: z.string().min(1, 'Color name is required'),
  hex_code: z.string().regex(/^[0-9A-Fa-f]{0,6}$/, 'Invalid hex code format').optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const colorUpdateSchema = colorSchema.partial();

