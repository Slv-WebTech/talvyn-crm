import { ApiError } from '../utils/ApiError.js'

const PRISMA_STATUS_BY_CODE = {
  P2002: 409,
  P2025: 404,
}

function fromPrismaError(err) {
  const status = PRISMA_STATUS_BY_CODE[err.code]
  if (!status) return null
  const message =
    err.code === 'P2002'
      ? `A record with this ${err.meta?.target ?? 'value'} already exists`
      : 'Record not found'
  return new ApiError(status, message, err.meta ?? null)
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let apiError = err instanceof ApiError ? err : null

  if (!apiError && err?.code?.startsWith?.('P')) {
    apiError = fromPrismaError(err)
  }

  if (!apiError) {
    console.error(err)
    apiError = new ApiError(500, 'Internal server error')
  }

  res.status(apiError.statusCode).json({
    error: { message: apiError.message, details: apiError.details ?? null },
  })
}
