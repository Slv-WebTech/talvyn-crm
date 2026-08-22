import { prisma } from '../../lib/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import { scopeToOwner, assertOwnership } from '../../utils/ownership.js'
import { parsePagination } from '../../utils/pagination.js'

function searchFilter(search) {
  if (!search) return {}
  return {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
    ],
  }
}

export async function listCustomers(user, query) {
  const { page, limit, skip, take } = parsePagination(query)
  const where = { ...scopeToOwner(user, 'ownerId'), ...searchFilter(query.search) }

  const [items, total] = await Promise.all([
    prisma.customer.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.customer.count({ where }),
  ])

  return { items, total, page, limit }
}

export function createCustomer(user, data) {
  return prisma.customer.create({ data: { ...data, ownerId: user.id } })
}

export async function getCustomerById(user, id) {
  const customer = await prisma.customer.findUnique({ where: { id } })
  if (!customer) throw new ApiError(404, 'Customer not found')
  assertOwnership(user, customer, 'ownerId')
  return customer
}

export async function updateCustomer(user, id, data) {
  await getCustomerById(user, id)
  return prisma.customer.update({ where: { id }, data })
}

export async function deleteCustomer(user, id) {
  await getCustomerById(user, id)
  await prisma.customer.delete({ where: { id } })
}

export async function getCustomerOpportunities(user, id) {
  await getCustomerById(user, id)
  return prisma.opportunity.findMany({
    where: { customerId: id },
    orderBy: { createdAt: 'desc' },
  })
}
