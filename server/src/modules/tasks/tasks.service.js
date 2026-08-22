import { prisma } from '../../lib/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import {
  scopeToOwner,
  assertOwnership,
  assertLinkedRecordsAccessible,
  isElevated,
} from '../../utils/ownership.js'
import { parsePagination } from '../../utils/pagination.js'

export async function listTasks(user, query) {
  const { page, limit, skip, take } = parsePagination(query)
  const where = {
    ...scopeToOwner(user, 'assignedToId'),
    ...(query.status ? { status: query.status } : {}),
    ...(query.assignedToId ? { assignedToId: query.assignedToId } : {}),
    ...(query.leadId ? { leadId: query.leadId } : {}),
    ...(query.customerId ? { customerId: query.customerId } : {}),
    ...(query.opportunityId ? { opportunityId: query.opportunityId } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.task.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.task.count({ where }),
  ])

  return { items, total, page, limit }
}

export async function createTask(user, data) {
  await assertLinkedRecordsAccessible(user, data)

  if (data.assignedToId && data.assignedToId !== user.id && !isElevated(user)) {
    throw new ApiError(403, 'A Sales Executive can only assign a task to themselves')
  }
  const assignedToId = data.assignedToId ?? user.id

  return prisma.task.create({
    data: { ...data, assignedToId, createdById: user.id, status: 'PENDING' },
  })
}

export async function getTaskById(user, id) {
  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) throw new ApiError(404, 'Task not found')
  assertOwnership(user, task, 'assignedToId')
  return task
}

export async function updateTask(user, id, data) {
  await getTaskById(user, id)
  await assertLinkedRecordsAccessible(user, data)

  if (data.assignedToId && data.assignedToId !== user.id && !isElevated(user)) {
    throw new ApiError(403, 'A Sales Executive can only assign a task to themselves')
  }

  return prisma.task.update({ where: { id }, data })
}

export async function updateTaskStatus(user, id, status) {
  await getTaskById(user, id)
  return prisma.task.update({
    where: { id },
    data: { status, completedAt: status === 'COMPLETED' ? new Date() : null },
  })
}

export async function deleteTask(user, id) {
  await getTaskById(user, id)
  await prisma.task.delete({ where: { id } })
}
