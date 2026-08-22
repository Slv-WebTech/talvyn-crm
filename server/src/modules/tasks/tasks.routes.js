import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { authenticate } from '../../middleware/auth.js'
import {
  idParamSchema,
  listQuerySchema,
  createTaskSchema,
  updateTaskSchema,
  statusUpdateSchema,
} from './tasks.validation.js'
import * as tasksController from './tasks.controller.js'

export const tasksRouter = Router()

tasksRouter.use(authenticate)

tasksRouter.get('/', validate({ query: listQuerySchema }), tasksController.list)
tasksRouter.post('/', validate({ body: createTaskSchema }), tasksController.create)
tasksRouter.get('/:id', validate({ params: idParamSchema }), tasksController.getOne)
tasksRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: updateTaskSchema }),
  tasksController.update,
)
tasksRouter.patch(
  '/:id/status',
  validate({ params: idParamSchema, body: statusUpdateSchema }),
  tasksController.updateStatus,
)
tasksRouter.delete('/:id', validate({ params: idParamSchema }), tasksController.remove)
