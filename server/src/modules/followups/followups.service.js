import { prisma } from '../../lib/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import {
  scopeToOwner,
  assertOwnership,
  assertLinkedRecordsAccessible,
  isElevated,
} from '../../utils/ownership.js'
import { parsePagination } from '../../utils/pagination.js'

export async function listFollowUps(user, query) {
  const { page, limit, skip, take } = parsePagination(query)
  const where = {
    ...scopeToOwner(user, 'assignedToId'),
    ...(query.leadId ? { leadId: query.leadId } : {}),
    ...(query.customerId ? { customerId: query.customerId } : {}),
    ...(query.opportunityId ? { opportunityId: query.opportunityId } : {}),
  }

  if (query.upcoming) {
    where.status = 'PENDING'
    where.scheduledAt = { gte: new Date() }
  } else if (query.status) {
    where.status = query.status
  }

  const orderBy = query.upcoming ? { scheduledAt: 'asc' } : { scheduledAt: 'desc' }

  const [items, total] = await Promise.all([
    prisma.followUp.findMany({ where, skip, take, orderBy }),
    prisma.followUp.count({ where }),
  ])

  return { items, total, page, limit }
}

export async function createFollowUp(user, data) {
  await assertLinkedRecordsAccessible(user, data)
  const assignedToId = isElevated(user) ? (data.assignedToId ?? user.id) : user.id

  return prisma.followUp.create({
    data: { ...data, assignedToId, status: 'PENDING' },
  })
}

export async function getFollowUpById(user, id) {
  const followUp = await prisma.followUp.findUnique({ where: { id } })
  if (!followUp) throw new ApiError(404, 'Follow-up not found')
  assertOwnership(user, followUp, 'assignedToId')
  return followUp
}

export async function updateFollowUp(user, id, data) {
  await getFollowUpById(user, id)
  await assertLinkedRecordsAccessible(user, data)
  return prisma.followUp.update({ where: { id }, data })
}

export async function completeFollowUp(user, id) {
  await getFollowUpById(user, id)
  return prisma.followUp.update({
    where: { id },
    data: { status: 'COMPLETED', completedAt: new Date() },
  })
}

export async function deleteFollowUp(user, id) {
  await getFollowUpById(user, id)
  await prisma.followUp.delete({ where: { id } })
}
