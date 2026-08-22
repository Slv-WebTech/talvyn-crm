import { prisma } from '../../lib/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import { scopeToOwner, assertOwnership, isElevated } from '../../utils/ownership.js'
import { parsePagination } from '../../utils/pagination.js'

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function searchFilter(search) {
  if (!search) return {}
  return {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ],
  }
}

export async function listLeads(user, query) {
  const { page, limit, skip, take } = parsePagination(query)
  const where = {
    ...scopeToOwner(user, 'assignedToId'),
    ...searchFilter(query.search),
    ...(query.status ? { status: query.status } : {}),
    ...(query.assignedToId ? { assignedToId: query.assignedToId } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.lead.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.lead.count({ where }),
  ])

  return { items, total, page, limit }
}

export async function createLead(user, data) {
  const email = normalizeEmail(data.email)

  const duplicate = await prisma.lead.findFirst({
    where: { email, company: { equals: data.company, mode: 'insensitive' } },
  })
  if (duplicate) {
    throw new ApiError(409, 'A lead with this email and company already exists')
  }

  const assignedToId = isElevated(user) ? (data.assignedToId ?? user.id) : user.id

  return prisma.lead.create({
    data: { ...data, email, assignedToId, status: 'NEW' },
  })
}

export async function getLeadById(user, id) {
  const lead = await prisma.lead.findUnique({ where: { id } })
  if (!lead) throw new ApiError(404, 'Lead not found')
  assertOwnership(user, lead, 'assignedToId')
  return lead
}

export async function updateLead(user, id, data) {
  const existing = await getLeadById(user, id)

  if (data.assignedToId && data.assignedToId !== existing.assignedToId && !isElevated(user)) {
    throw new ApiError(403, 'Only an Admin or Sales Manager can reassign a lead')
  }

  const nextData = { ...data }
  if (nextData.email) nextData.email = normalizeEmail(nextData.email)

  return prisma.lead.update({ where: { id }, data: nextData })
}

export async function deleteLead(user, id) {
  await getLeadById(user, id)
  await prisma.lead.delete({ where: { id } })
}

// The core Lead -> Customer/Opportunity bridge. Wrapped in a transaction so the
// Customer, Opportunity, and Lead status change either all land or none do.
export async function convertLead(user, id) {
  return prisma.$transaction(async (tx) => {
    const lead = await tx.lead.findUnique({ where: { id } })
    if (!lead) throw new ApiError(404, 'Lead not found')
    assertOwnership(user, lead, 'assignedToId')

    if (lead.status === 'CONVERTED') {
      // Idempotent guard: repeat-click returns the existing linkage instead of
      // creating duplicate Customer/Opportunity records. See docs/TECHNICAL_DEBT.md
      // for the known race-condition tradeoff on near-simultaneous double-clicks.
      throw new ApiError(409, 'Lead has already been converted', {
        customerId: lead.convertedToCustomerId,
      })
    }
    if (lead.status === 'LOST') {
      throw new ApiError(400, 'Cannot convert a lost lead')
    }

    let customer = await tx.customer.findUnique({ where: { email: lead.email } })
    if (!customer) {
      customer = await tx.customer.create({
        data: {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          ownerId: lead.assignedToId,
        },
      })
    }

    const opportunity = await tx.opportunity.create({
      data: {
        title: `${lead.company} - ${lead.name}`,
        stage: 'QUALIFIED',
        customerId: customer.id,
        leadId: lead.id,
        assignedToId: lead.assignedToId,
        notes: lead.notes,
      },
    })

    const updatedLead = await tx.lead.update({
      where: { id: lead.id },
      data: { status: 'CONVERTED', convertedAt: new Date(), convertedToCustomerId: customer.id },
    })

    return { lead: updatedLead, customer, opportunity }
  })
}
