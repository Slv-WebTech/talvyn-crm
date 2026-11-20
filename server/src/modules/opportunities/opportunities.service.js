import { prisma } from '../../lib/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import { scopeToOwner, assertOwnership, isElevated } from '../../utils/ownership.js'
import { parsePagination } from '../../utils/pagination.js'
import { recordAudit } from '../../utils/auditLog.js'
import { notify } from '../../utils/notify.js'

const CLOSED_STAGES = new Set(['WON', 'LOST'])

// Prisma returns Decimal for `value`; convert to a plain number before this
// ever reaches a JSON response (see docs/DATABASE.md).
function serialize(opportunity) {
  return { ...opportunity, value: opportunity.value == null ? null : Number(opportunity.value) }
}

async function assertCustomerAccessible(user, customerId) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } })
  if (!customer) throw new ApiError(404, 'Customer not found')
  assertOwnership(user, customer, 'ownerId')
  return customer
}

export async function listOpportunities(user, query) {
  const { page, limit, skip, take } = parsePagination(query)
  const where = {
    ...scopeToOwner(user, 'assignedToId'),
    ...(query.stage ? { stage: query.stage } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.opportunity.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.opportunity.count({ where }),
  ])

  return { items: items.map(serialize), total, page, limit }
}

export async function createOpportunity(user, data) {
  await assertCustomerAccessible(user, data.customerId)
  const assignedToId = isElevated(user) ? (data.assignedToId ?? user.id) : user.id

  const stage = data.stage ?? 'NEW_LEAD'
  const opportunity = await prisma.opportunity.create({
    data: { ...data, assignedToId, stage, closedAt: CLOSED_STAGES.has(stage) ? new Date() : null },
  })
  await recordAudit(user, 'CREATE', 'Opportunity', opportunity.id, data)
  return serialize(opportunity)
}

export async function getOpportunityById(user, id) {
  const opportunity = await prisma.opportunity.findUnique({ where: { id } })
  if (!opportunity) throw new ApiError(404, 'Opportunity not found')
  assertOwnership(user, opportunity, 'assignedToId')
  return serialize(opportunity)
}

export async function updateOpportunity(user, id, data) {
  const existing = await getOpportunityById(user, id)
  if (data.assignedToId && data.assignedToId !== existing.assignedToId && !isElevated(user)) {
    throw new ApiError(403, 'Only an Admin or Sales Manager can reassign an opportunity')
  }
  const opportunity = await prisma.opportunity.update({ where: { id }, data })
  await recordAudit(user, 'UPDATE', 'Opportunity', id, data)
  return serialize(opportunity)
}

export async function updateOpportunityStage(user, id, stage) {
  const existing = await getOpportunityById(user, id)
  const opportunity = await prisma.opportunity.update({
    where: { id },
    // Keep the original close time when re-saving the same closed stage.
    data: {
      stage,
      closedAt: CLOSED_STAGES.has(stage) ? (existing.stage === stage && existing.closedAt ? existing.closedAt : new Date()) : null,
    },
  })
  await recordAudit(user, 'UPDATE', 'Opportunity', id, { stage })

  if (stage !== existing.stage && opportunity.assignedToId && opportunity.assignedToId !== user.id) {
    await notify(
      opportunity.assignedToId,
      'OPPORTUNITY_STAGE_CHANGED',
      `${opportunity.title} moved to ${stage.replace(/_/g, ' ')}`,
      { type: 'opportunity', id: opportunity.id },
    )
  }

  return serialize(opportunity)
}

export async function deleteOpportunity(user, id) {
  await getOpportunityById(user, id)
  await prisma.opportunity.delete({ where: { id } })
  await recordAudit(user, 'DELETE', 'Opportunity', id)
}
