import { z } from 'zod'

export const ROLES = ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE']

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid id'),
})

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Must be a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(ROLES).optional(),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(ROLES).optional(),
  isActive: z.boolean().optional(),
})
