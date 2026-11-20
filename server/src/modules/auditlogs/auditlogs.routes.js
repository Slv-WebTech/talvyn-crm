import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { authenticate, authorize } from '../../middleware/auth.js'
import { listQuerySchema } from './auditlogs.validation.js'
import * as auditLogsController from './auditlogs.controller.js'

export const auditLogsRouter = Router()

auditLogsRouter.use(authenticate)

auditLogsRouter.get(
  '/',
  authorize('ADMIN', 'SALES_MANAGER'),
  validate({ query: listQuerySchema }),
  auditLogsController.list,
)
