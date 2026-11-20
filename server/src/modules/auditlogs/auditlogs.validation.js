import { z } from 'zod'

export const listQuerySchema = z.object({
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
})
