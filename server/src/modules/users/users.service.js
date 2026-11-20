import { prisma } from '../../lib/prisma.js'
import { hashPassword } from '../../utils/password.js'
import { ApiError } from '../../utils/ApiError.js'
import { recordAudit } from '../../utils/auditLog.js'

const SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
}

export function listUsers() {
  return prisma.user.findMany({ select: SAFE_SELECT, orderBy: { createdAt: 'asc' } })
}

export async function createUser(actor, { name, email, password, role }) {
  const hashed = await hashPassword(password)
  const user = await prisma.user.create({
    data: { name, email: email.trim().toLowerCase(), password: hashed, role: role ?? 'SALES_EXECUTIVE' },
    select: SAFE_SELECT,
  })
  await recordAudit(actor, 'CREATE', 'User', user.id, { name, email, role })
  return user
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id }, select: SAFE_SELECT })
  if (!user) throw new ApiError(404, 'User not found')
  return user
}

// Never let the system end up with no active Admin (self-demotion / last-admin deactivation).
async function assertNotLastAdmin(target, change) {
  const losesAdmin =
    target.role === 'ADMIN' &&
    target.isActive &&
    ((change.role && change.role !== 'ADMIN') || change.isActive === false)
  if (!losesAdmin) return
  const otherAdmins = await prisma.user.count({
    where: { role: 'ADMIN', isActive: true, id: { not: target.id } },
  })
  if (otherAdmins === 0) {
    throw new ApiError(400, 'At least one active Admin must remain')
  }
}

export async function updateUser(actor, id, data) {
  const target = await getUserById(id)
  await assertNotLastAdmin(target, data)
  const user = await prisma.user.update({ where: { id }, data, select: SAFE_SELECT })
  await recordAudit(actor, 'UPDATE', 'User', id, data)
  return user
}

export async function deactivateUser(actor, id) {
  const target = await getUserById(id)
  await assertNotLastAdmin(target, { isActive: false })
  const user = await prisma.user.update({ where: { id }, data: { isActive: false }, select: SAFE_SELECT })
  await recordAudit(actor, 'UPDATE', 'User', id, { isActive: false })
  return user
}
