import { prisma } from '../lib/prisma.js'
import { ApiError } from './ApiError.js'

const ELEVATED_ROLES = new Set(['ADMIN', 'SALES_MANAGER'])

export function isElevated(user) {
  return ELEVATED_ROLES.has(user.role)
}

// Returns a Prisma `where` fragment: {} for Admin/Manager (see everything),
// or { [field]: user.id } for a Sales Executive (see only their own).
export function scopeToOwner(user, field = 'assignedToId') {
  if (isElevated(user)) return {}
  return { [field]: user.id }
}

export function assertOwnership(user, record, field = 'assignedToId') {
  if (isElevated(user)) return
  if (record[field] !== user.id) {
    throw new ApiError(403, 'You do not have access to this record')
  }
}

// Shared by FollowUps and Tasks: both can optionally link to a Lead, Customer,
// and/or Opportunity, and a Sales Executive must not be able to attach their
// record to something they don't own.
export async function assertLinkedRecordsAccessible(user, { leadId, customerId, opportunityId }) {
  if (leadId) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) throw new ApiError(404, 'Lead not found')
    assertOwnership(user, lead, 'assignedToId')
  }
  if (customerId) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } })
    if (!customer) throw new ApiError(404, 'Customer not found')
    assertOwnership(user, customer, 'ownerId')
  }
  if (opportunityId) {
    const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } })
    if (!opportunity) throw new ApiError(404, 'Opportunity not found')
    assertOwnership(user, opportunity, 'assignedToId')
  }
}
