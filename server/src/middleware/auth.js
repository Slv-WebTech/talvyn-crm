import { prisma } from '../lib/prisma.js'
import { verifyToken } from '../utils/jwt.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Missing or invalid Authorization header')
  }

  let payload
  try {
    payload = verifyToken(header.slice(7))
  } catch {
    throw new ApiError(401, 'Invalid or expired token')
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } })
  if (!user || !user.isActive) {
    throw new ApiError(401, 'User not found or inactive')
  }

  const { password, ...safeUser } = user
  req.user = safeUser
  next()
})

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action')
    }
    next()
  }
}
