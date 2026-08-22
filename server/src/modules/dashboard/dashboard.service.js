import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { scopeToOwner, isElevated } from '../../utils/ownership.js'
import { listFollowUps } from '../followups/followups.service.js'

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export async function getSummary(user) {
  const customerScope = scopeToOwner(user, 'ownerId')
  const opportunityScope = scopeToOwner(user, 'assignedToId')

  const [totalCustomers, totalLeads, pipelineByStage, monthlyRevenueAgg, performanceRows] =
    await Promise.all([
      prisma.customer.count({ where: customerScope }),
      prisma.lead.count({ where: scopeToOwner(user, 'assignedToId') }),
      prisma.opportunity.groupBy({
        by: ['stage'],
        where: opportunityScope,
        _count: { _all: true },
        _sum: { value: true },
      }),
      prisma.opportunity.aggregate({
        where: { ...opportunityScope, stage: 'WON', closedAt: { gte: startOfMonth() } },
        _sum: { value: true },
      }),
      prisma.opportunity.groupBy({
        by: ['assignedToId'],
        where: { ...opportunityScope, stage: 'WON' },
        _count: { _all: true },
        _sum: { value: true },
      }),
    ])

  const wonRow = pipelineByStage.find((row) => row.stage === 'WON')
  const lostRow = pipelineByStage.find((row) => row.stage === 'LOST')

  const performerIds = performanceRows.map((row) => row.assignedToId).filter(Boolean)
  const performers = performerIds.length
    ? await prisma.user.findMany({ where: { id: { in: performerIds } }, select: { id: true, name: true } })
    : []
  const nameById = new Map(performers.map((u) => [u.id, u.name]))

  return {
    totalCustomers,
    totalLeads,
    dealsWon: wonRow?._count._all ?? 0,
    dealsLost: lostRow?._count._all ?? 0,
    monthlyRevenue: Number(monthlyRevenueAgg._sum.value ?? 0),
    pipelineByStage: pipelineByStage.map((row) => ({
      stage: row.stage,
      count: row._count._all,
      value: Number(row._sum.value ?? 0),
    })),
    salesPerformance: performanceRows.map((row) => ({
      userId: row.assignedToId,
      name: nameById.get(row.assignedToId) ?? 'Unassigned',
      dealsWon: row._count._all,
      value: Number(row._sum.value ?? 0),
    })),
  }
}

export async function getUpcomingFollowUps(user, limit = 5) {
  const { items } = await listFollowUps(user, { upcoming: true, limit, page: 1 })
  return items
}

export async function getRevenueTrend(user) {
  const scopeClause = isElevated(user)
    ? Prisma.sql``
    : Prisma.sql`AND "assignedToId" = ${user.id}`

  const rows = await prisma.$queryRaw`
    SELECT date_trunc('month', "closedAt") AS month, COALESCE(SUM(value), 0) AS total
    FROM "Opportunity"
    WHERE stage = 'WON'
      AND "closedAt" >= (date_trunc('month', now()) - interval '5 months')
      ${scopeClause}
    GROUP BY month
    ORDER BY month ASC
  `

  return rows.map((row) => ({ month: row.month, total: Number(row.total) }))
}
