import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { authenticate } from '../../middleware/auth.js'
import { idParamSchema } from './notifications.validation.js'
import * as notificationsController from './notifications.controller.js'

export const notificationsRouter = Router()

notificationsRouter.use(authenticate)

notificationsRouter.get('/', notificationsController.list)
notificationsRouter.patch('/read-all', notificationsController.markAllRead)
notificationsRouter.patch(
  '/:id/read',
  validate({ params: idParamSchema }),
  notificationsController.markRead,
)
