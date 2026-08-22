import { z } from 'zod'

export const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED']

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid id'),
})

export const listQuerySchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  assignedToId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  opportunityId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
})

const linkFields = {
  leadId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  opportunityId: z.string().uuid().optional(),
}

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  assignedToId: z.string().uuid().optional(),
  ...linkFields,
})

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  assignedToId: z.string().uuid().optional(),
  ...linkFields,
})

export const statusUpdateSchema = z.object({
  status: z.enum(TASK_STATUSES),
})
