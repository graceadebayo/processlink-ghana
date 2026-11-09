import { z } from 'zod';

export const investmentSchema = z.object({
  equipmentId: z.string().min(1),
  amount: z.coerce.number().finite().positive().max(100000000),
  phone: z.string().trim().min(9, 'Enter a valid Mobile Money number.').max(20),
});
