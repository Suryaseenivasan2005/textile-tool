import { z } from 'zod';

export const paymentSchema = z.object({
  reference_type: z.enum(['vendor', 'customer']),
  reference_id: z.string().min(1, 'Reference ID is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  payment_mode: z.enum(['cash', 'bank', 'cheque', 'online']),
  payment_date: z.string().min(1, 'Payment date is required'),
});

