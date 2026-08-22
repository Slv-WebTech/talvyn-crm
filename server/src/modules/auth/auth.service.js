import { prisma } from '../../lib/prisma.js'
import { hashPassword, comparePassword } from '../../utils/password.js'
import { signToken } from '../../utils/jwt.js'
import { ApiError } from '../../utils/ApiError.js'

function toSafeUser(user) {
  const { password, ...safeUser } = user
  return safeUser
}

export async function registerUser({ name, email, password }) {
  const hashed = await hashPassword(password)

  // Self-serve registration always creates a SALES_EXECUTIVE — elevated roles
  // are granted afterward by an Admin via the Users module, never at signup.
  const user = await prisma.user.create({
    data: { name, email: email.trim().toLowerCase(), password: hashed, role: 'SALES_EXECUTIVE' },
  })

  const token = signToken({ id: user.id })
  return { user: toSafeUser(user), token }
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const valid = await comparePassword(password, user.password)
  if (!valid) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const token = signToken({ id: user.id })
  return { user: toSafeUser(user), token }
}
