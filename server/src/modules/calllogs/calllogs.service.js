import { prisma } from '../../lib/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import {
  scopeToOwner,
  assertOwnership,
  assertLinkedRecordsAccessible,
  isElevated,
} from '../../utils/ownership.js'
import { parsePagination } from '../../utils/pagination.js'
import { recordAudit } from '../../utils/auditLog.js'

export async function listCallLogs(user, query) {
  const { page, limit, skip, take } = parsePagination(query)
  const where = {
    ...scopeToOwner(user, 'assignedToId'),
    ...(query.outcome ? { outcome: query.outcome } : {}),
    ...(query.leadId ? { leadId: query.leadId } : {}),
    ...(query.customerId ? { customerId: query.customerId } : {}),
    ...(query.opportunityId ? { opportunityId: query.opportunityId } : {}),
  }
  const [items, total] = await Promise.all([
    prisma.callLog.findMany({ where, skip, take, orderBy: { calledAt: 'desc' } }),
    prisma.callLog.count({ where }),
  ])
  return { items, total, page, limit }
}

export async function createCallLog(user, data) {
  await assertLinkedRecordsAccessible(user, data)
  const assignedToId = isElevated(user) ? (data.assignedToId ?? user.id) : user.id
  const callLog = await prisma.callLog.create({ data: { ...data, assignedToId } })
  await recordAudit(user, 'CREATE', 'CallLog', callLog.id, data)
  return callLog
}

export async function getCallLogById(user, id) {
  const callLog = await prisma.callLog.findUnique({ where: { id } })
  if (!callLog) throw new ApiError(404, 'Call log not found')
  assertOwnership(user, callLog, 'assignedToId')
  return callLog
}

export async function updateCallLog(user, id, data) {
  await getCallLogById(user, id)
  await assertLinkedRecordsAccessible(user, data)
  const callLog = await prisma.callLog.update({ where: { id }, data })
  await recordAudit(user, 'UPDATE', 'CallLog', id, data)
  return callLog
}

export async function deleteCallLog(user, id) {
  await getCallLogById(user, id)
  await prisma.callLog.delete({ where: { id } })
  await recordAudit(user, 'DELETE', 'CallLog', id)
}
