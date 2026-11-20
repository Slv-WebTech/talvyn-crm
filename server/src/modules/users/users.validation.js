import { z } from 'zod'
import { passwordSchema } from '../auth/auth.validation.js'

export const ROLES = ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE']

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid id'),
})

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Must be a valid email'),
  password: passwordSchema,
  role: z.enum(ROLES).optional(),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(ROLES).optional(),
  isActive: z.boolean().optional(),
})
