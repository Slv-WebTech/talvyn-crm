import { z } from 'zod'

export const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']
// CONVERTED is a terminal state only ever set by the convert-lead transaction,
// never accepted as a direct manual status update.
const MANUAL_LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'LOST']

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid id'),
})

export const listQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  assignedToId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
})

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().min(1, 'Company is required'),
  email: z.string().email('Must be a valid email'),
  phone: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  assignedToId: z.string().uuid().optional(),
})

export const updateLeadSchema = z.object({
  name: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
  email: z.string().email('Must be a valid email').optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(MANUAL_LEAD_STATUSES).optional(),
  assignedToId: z.string().uuid().optional(),
})
