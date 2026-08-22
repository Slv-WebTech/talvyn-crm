import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { authenticate } from '../../middleware/auth.js'
import {
  idParamSchema,
  listQuerySchema,
  createFollowUpSchema,
  updateFollowUpSchema,
} from './followups.validation.js'
import * as followUpsController from './followups.controller.js'

export const followUpsRouter = Router()

followUpsRouter.use(authenticate)

followUpsRouter.get('/', validate({ query: listQuerySchema }), followUpsController.list)
followUpsRouter.post('/', validate({ body: createFollowUpSchema }), followUpsController.create)
followUpsRouter.get('/:id', validate({ params: idParamSchema }), followUpsController.getOne)
followUpsRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: updateFollowUpSchema }),
  followUpsController.update,
)
followUpsRouter.patch(
  '/:id/complete',
  validate({ params: idParamSchema }),
  followUpsController.complete,
)
followUpsRouter.delete('/:id', validate({ params: idParamSchema }), followUpsController.remove)
