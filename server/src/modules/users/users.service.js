import { prisma } from '../../lib/prisma.js'
import { hashPassword } from '../../utils/password.js'
import { ApiError } from '../../utils/ApiError.js'

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

export async function createUser({ name, email, password, role }) {
  const hashed = await hashPassword(password)
  return prisma.user.create({
    data: { name, email: email.trim().toLowerCase(), password: hashed, role: role ?? 'SALES_EXECUTIVE' },
    select: SAFE_SELECT,
  })
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id }, select: SAFE_SELECT })
  if (!user) throw new ApiError(404, 'User not found')
  return user
}

export async function updateUser(id, data) {
  await getUserById(id)
  return prisma.user.update({ where: { id }, data, select: SAFE_SELECT })
}

export async function deactivateUser(id) {
  await getUserById(id)
  return prisma.user.update({ where: { id }, data: { isActive: false }, select: SAFE_SELECT })
}
