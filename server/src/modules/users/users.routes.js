import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { authenticate, authorize } from '../../middleware/auth.js'
import { idParamSchema, createUserSchema, updateUserSchema } from './users.validation.js'
import * as usersController from './users.controller.js'

export const usersRouter = Router()

usersRouter.use(authenticate)

usersRouter.get('/', authorize('ADMIN', 'SALES_MANAGER'), usersController.list)
usersRouter.post('/', authorize('ADMIN'), validate({ body: createUserSchema }), usersController.create)
usersRouter.get(
  '/:id',
  authorize('ADMIN', 'SALES_MANAGER'),
  validate({ params: idParamSchema }),
  usersController.getOne,
)
usersRouter.put(
  '/:id',
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: updateUserSchema }),
  usersController.update,
)
usersRouter.delete(
  '/:id',
  authorize('ADMIN'),
  validate({ params: idParamSchema }),
  usersController.deactivate,
)
