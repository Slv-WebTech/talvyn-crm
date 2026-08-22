import { z } from 'zod'

export const OPPORTUNITY_STAGES = [
  'NEW_LEAD',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'NEGOTIATION',
  'WON',
  'LOST',
]

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid id'),
})

export const listQuerySchema = z.object({
  stage: z.enum(OPPORTUNITY_STAGES).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
})

export const createOpportunitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  customerId: z.string().uuid('customerId must be a valid id'),
  leadId: z.string().uuid().optional(),
  value: z.coerce.number().nonnegative().optional(),
  stage: z.enum(OPPORTUNITY_STAGES).optional(),
  expectedCloseDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  assignedToId: z.string().uuid().optional(),
})

export const updateOpportunitySchema = z.object({
  title: z.string().min(1).optional(),
  value: z.coerce.number().nonnegative().optional(),
  expectedCloseDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  assignedToId: z.string().uuid().optional(),
})

export const stageUpdateSchema = z.object({
  stage: z.enum(OPPORTUNITY_STAGES),
})
