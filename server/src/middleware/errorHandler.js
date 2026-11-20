import { ApiError } from '../utils/ApiError.js'

const PRISMA_STATUS_BY_CODE = {
  P2002: 409,
  P2003: 409,
  P2025: 404,
}

function fromPrismaError(err) {
  const status = PRISMA_STATUS_BY_CODE[err.code]
  if (!status) return null
  let message = 'Record not found'
  if (err.code === 'P2002') message = `A record with this ${err.meta?.target ?? 'value'} already exists`
  if (err.code === 'P2003') message = 'This record references, or is referenced by, another record that does not allow the operation'
  return new ApiError(status, message, err.meta ?? null)
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let apiError = err instanceof ApiError ? err : null

  if (!apiError && err?.code?.startsWith?.('P')) {
    apiError = fromPrismaError(err)
  }

  // body-parser errors (malformed JSON, payload too large) carry their own 4xx status.
  if (!apiError && Number.isInteger(err?.status) && err.status >= 400 && err.status < 500 && err.expose) {
    const message = err.type === 'entity.too.large' ? 'Request body too large' : 'Malformed request body'
    apiError = new ApiError(err.status, message)
  }

  if (!apiError) {
    console.error(err)
    apiError = new ApiError(500, 'Internal server error')
  }

  res.status(apiError.statusCode).json({
    error: { message: apiError.message, details: apiError.details ?? null },
  })
}
