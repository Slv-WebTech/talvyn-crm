import { z } from 'zod'

export const CALL_OUTCOMES = [
  'CONNECTED',
  'NO_ANSWER',
  'VOICEMAIL',
  'BUSY',
  'WRONG_NUMBER',
  'FOLLOW_UP_REQUIRED',
]

export const idParamSchema = z.object({ id: z.string().uuid('Invalid id') })

export const listQuerySchema = z.object({
  outcome: z.enum(CALL_OUTCOMES).optional(),
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

export const createCallLogSchema = z
  .object({
    outcome: z.enum(CALL_OUTCOMES),
    duration: z.number().int().nonnegative().optional(),
    notes: z.string().optional(),
    calledAt: z.coerce.date().optional(),
    assignedToId: z.string().uuid().optional(),
    ...linkFields,
  })
  .refine((d) => d.leadId || d.customerId || d.opportunityId, {
    message: 'Must link to at least one of lead, customer, or opportunity',
    path: ['leadId'],
  })

export const updateCallLogSchema = z.object({
  outcome: z.enum(CALL_OUTCOMES).optional(),
  duration: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
  calledAt: z.coerce.date().optional(),
  ...linkFields,
})
