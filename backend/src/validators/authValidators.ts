import { z } from 'zod';
import { VALIDATION } from '../constants';

export const registerSchema = z.object({
  mobile: z.string().regex(VALIDATION.MOBILE_REGEX, 'Mobile number must be 10 digits'),
  password: z.string().min(VALIDATION.PASSWORD_MIN_LENGTH, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  mobile: z.string().regex(VALIDATION.MOBILE_REGEX, 'Mobile number must be 10 digits'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

