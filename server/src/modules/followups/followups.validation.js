import { z } from 'zod'

export const FOLLOWUP_TYPES = ['CALL', 'MEETING', 'EMAIL', 'REMINDER', 'OTHER']
export const FOLLOWUP_STATUSES = ['PENDING', 'COMPLETED', 'CANCELLED']

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid id'),
})

export const listQuerySchema = z.object({
  status: z.enum(FOLLOWUP_STATUSES).optional(),
  upcoming: z.coerce.boolean().optional(),
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

export const createFollowUpSchema = z
  .object({
    type: z.enum(FOLLOWUP_TYPES).optional(),
    notes: z.string().optional(),
    scheduledAt: z.coerce.date(),
    assignedToId: z.string().uuid().optional(),
    ...linkFields,
  })
  .refine((data) => data.leadId || data.customerId || data.opportunityId, {
    message: 'Must link to at least one of lead, customer, or opportunity',
    path: ['leadId'],
  })

export const updateFollowUpSchema = z.object({
  type: z.enum(FOLLOWUP_TYPES).optional(),
  notes: z.string().optional(),
  scheduledAt: z.coerce.date().optional(),
  assignedToId: z.string().uuid().optional(),
  ...linkFields,
})
