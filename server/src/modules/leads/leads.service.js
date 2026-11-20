import { prisma } from '../../lib/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import { scopeToOwner, assertOwnership, isElevated } from '../../utils/ownership.js'
import { parsePagination } from '../../utils/pagination.js'
import { recordAudit } from '../../utils/auditLog.js'
import { notify } from '../../utils/notify.js'

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

  const lead = await prisma.lead.create({
    data: { ...data, email, assignedToId, status: 'NEW' },
  })

  await recordAudit(user, 'CREATE', 'Lead', lead.id, data)
  if (assignedToId !== user.id) {
    await notify(assignedToId, 'LEAD_ASSIGNED', `You were assigned a new lead: ${lead.name} (${lead.company})`, {
      type: 'lead',
      id: lead.id,
    })
  }

  return lead
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

  if (existing.status === 'CONVERTED' && data.status && data.status !== 'CONVERTED') {
    throw new ApiError(400, 'A converted lead cannot change status')
  }

  const nextData = { ...data }
  if (nextData.email) nextData.email = normalizeEmail(nextData.email)

  const lead = await prisma.lead.update({ where: { id }, data: nextData })
  await recordAudit(user, 'UPDATE', 'Lead', id, nextData)

  if (nextData.assignedToId && nextData.assignedToId !== existing.assignedToId && nextData.assignedToId !== user.id) {
    await notify(nextData.assignedToId, 'LEAD_ASSIGNED', `You were assigned a lead: ${lead.name} (${lead.company})`, {
      type: 'lead',
      id: lead.id,
    })
  }

  return lead
}

export async function deleteLead(user, id) {
  await getLeadById(user, id)
  await prisma.lead.delete({ where: { id } })
  await recordAudit(user, 'DELETE', 'Lead', id)
}

// The core Lead -> Customer/Opportunity bridge. Wrapped in a transaction so the
// Customer, Opportunity, and Lead status change either all land or none do.
export async function convertLead(user, id) {
  const result = await prisma.$transaction(async (tx) => {
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

    // Row-lock guard: a concurrent convert blocks here, then re-evaluates the
    // WHERE after the first commits and matches nothing -> 409 (closes the race).
    const claimed = await tx.lead.updateMany({
      where: { id, status: { notIn: ['CONVERTED', 'LOST'] } },
      data: { updatedAt: new Date() },
    })
    if (claimed.count === 0) {
      throw new ApiError(409, 'Lead has already been converted')
    }

    let customer = await tx.customer.findUnique({ where: { email: lead.email } })
    let customerCreated = false
    if (customer && customer.ownerId && !isElevated(user) && customer.ownerId !== user.id) {
      // Don't let a rep attach deals to a customer another rep owns.
      throw new ApiError(409, 'A customer with this email already exists and belongs to another user')
    }
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
      customerCreated = true
      await recordAudit(user, 'CREATE', 'Customer', customer.id, null, tx)
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
    await recordAudit(user, 'CREATE', 'Opportunity', opportunity.id, null, tx)

    const updatedLead = await tx.lead.update({
      where: { id: lead.id },
      data: { status: 'CONVERTED', convertedAt: new Date(), convertedToCustomerId: customer.id },
    })
    await recordAudit(user, 'UPDATE', 'Lead', updatedLead.id, { status: 'CONVERTED' }, tx)

    return { lead: updatedLead, customer, customerCreated, opportunity }
  })

  const { customerCreated, ...response } = result
  if (customerCreated && result.customer.ownerId && result.customer.ownerId !== user.id) {
    await notify(
      result.customer.ownerId,
      'LEAD_ASSIGNED',
      `A new customer was created from a converted lead: ${result.customer.name}`,
      { type: 'customer', id: result.customer.id },
    )
  }

  return response
}
