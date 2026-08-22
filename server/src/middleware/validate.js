import { ApiError } from '../utils/ApiError.js'

// schemas: { body?: ZodSchema, query?: ZodSchema, params?: ZodSchema }
export function validate(schemas) {
  return (req, res, next) => {
    for (const key of ['params', 'query', 'body']) {
      const schema = schemas[key]
      if (!schema) continue

      const result = schema.safeParse(req[key])
      if (!result.success) {
        const details = result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }))
        throw new ApiError(400, 'Validation failed', details)
      }
      if (key === 'query') {
        // Express 5 defines req.query as a getter-only accessor, so a plain
        // assignment throws. Redefining the own property shadows it safely.
        Object.defineProperty(req, 'query', { value: result.data, writable: true, configurable: true })
      } else {
        req[key] = result.data
      }
    }
    next()
  }
}
