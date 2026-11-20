import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { authenticate } from '../../middleware/auth.js'
import {
  idParamSchema,
  listQuerySchema,
  createCallLogSchema,
  updateCallLogSchema,
} from './calllogs.validation.js'
import * as callLogsController from './calllogs.controller.js'

export const callLogsRouter = Router()

callLogsRouter.use(authenticate)

callLogsRouter.get('/', validate({ query: listQuerySchema }), callLogsController.list)
callLogsRouter.post('/', validate({ body: createCallLogSchema }), callLogsController.create)
callLogsRouter.get('/:id', validate({ params: idParamSchema }), callLogsController.getOne)
callLogsRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: updateCallLogSchema }),
  callLogsController.update,
)
callLogsRouter.delete('/:id', validate({ params: idParamSchema }), callLogsController.remove)
