import { z } from 'zod'

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid id'),
})

export const listQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
})

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Must be a valid email').optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export const updateCustomerSchema = createCustomerSchema.partial()
