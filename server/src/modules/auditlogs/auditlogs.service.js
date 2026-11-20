import { prisma } from '../../lib/prisma.js'
import { parsePagination } from '../../utils/pagination.js'

export async function listAuditLogs(query) {
  const { page, limit, skip, take } = parsePagination(query)
  const where = {
    ...(query.entityType ? { entityType: query.entityType } : {}),
    ...(query.entityId ? { entityId: query.entityId } : {}),
    ...(query.userId ? { userId: query.userId } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ])

  return { items, total, page, limit }
}
