import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().trim().min(4).max(100),
  equipmentType: z.string().trim().min(2).max(60),
  description: z.string().trim().min(20).max(2000),
  region: z.string().trim().min(2).max(60),
  town: z.string().trim().min(2).max(80),
  cost: z.coerce.number().positive().max(100000000),
  fundingTarget: z.coerce.number().positive().max(100000000),
  fundingDeadline: z.string().datetime().optional().or(z.literal('')),
}).refine((data) => data.fundingTarget <= data.cost, { path: ['fundingTarget'], message: 'Funding target cannot exceed the equipment cost.' });

export const applicationSchema = z.object({ experience: z.string().trim().min(20, 'Please describe at least 20 characters of relevant experience.').max(1500) });
export const adminDecisionSchema = z.object({ decision: z.enum(['APPROVE', 'REJECT']), note: z.string().trim().max(500).optional() });
