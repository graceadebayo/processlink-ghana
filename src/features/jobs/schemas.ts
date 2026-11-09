import { z } from 'zod';

export const createJobSchema = z.object({
  equipmentId: z.string().min(1),
  produceType: z.string().trim().min(2).max(80),
  quantityKg: z.coerce.number().positive().max(1000000),
  location: z.string().trim().min(3).max(180),
  preferredDate: z.coerce.date().refine((d) => d >= new Date(new Date().setHours(0,0,0,0)), 'Choose today or a future date.'),
  price: z.coerce.number().positive().max(1000000),
});
export const jobStatusSchema = z.object({ action: z.enum(['ACCEPT','DECLINE','START','COMPLETE','CANCEL']) });
export const expenseSchema = z.object({
  equipmentId: z.string().min(1), jobId: z.string().optional(),
  amount: z.coerce.number().positive().max(1000000),
  category: z.enum(['FUEL','MAINTENANCE','REPAIRS','LABOUR','OTHER']),
  note: z.string().trim().max(500).optional(),
  receiptImageUrl: z.string().max(500).refine((v) => v === '' || v.startsWith('/api/expenses/receipt/') || /^https:\/\//.test(v), 'Receipt must be an uploaded image or HTTPS URL.').optional(),
});
export const reviewSchema = z.object({ rating: z.coerce.number().int().min(1).max(5), comment: z.string().trim().max(1000).optional() });
