import { z } from 'zod';
export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(80),
  email: z.email('Enter a valid email address').transform(v => v.toLowerCase()),
  phone: z.string().trim().max(24).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
  role: z.enum(['INVESTOR', 'OPERATOR', 'CUSTOMER']),
});
export const loginSchema = z.object({ email: z.email().transform(v => v.toLowerCase()), password: z.string().min(1) });
