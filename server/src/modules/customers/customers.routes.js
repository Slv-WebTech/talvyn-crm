import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { authenticate } from '../../middleware/auth.js'
import {
  idParamSchema,
  listQuerySchema,
  createCustomerSchema,
  updateCustomerSchema,
} from './customers.validation.js'
import * as customersController from './customers.controller.js'

export const customersRouter = Router()

customersRouter.use(authenticate)

customersRouter.get('/', validate({ query: listQuerySchema }), customersController.list)
customersRouter.post('/', validate({ body: createCustomerSchema }), customersController.create)
customersRouter.get(
  '/:id/opportunities',
  validate({ params: idParamSchema }),
  customersController.opportunities,
)
customersRouter.get('/:id', validate({ params: idParamSchema }), customersController.getOne)
customersRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: updateCustomerSchema }),
  customersController.update,
)
customersRouter.delete('/:id', validate({ params: idParamSchema }), customersController.remove)
