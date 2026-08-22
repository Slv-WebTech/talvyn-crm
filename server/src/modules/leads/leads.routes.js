import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { authenticate } from '../../middleware/auth.js'
import { idParamSchema, listQuerySchema, createLeadSchema, updateLeadSchema } from './leads.validation.js'
import * as leadsController from './leads.controller.js'

export const leadsRouter = Router()

leadsRouter.use(authenticate)

leadsRouter.get('/', validate({ query: listQuerySchema }), leadsController.list)
leadsRouter.post('/', validate({ body: createLeadSchema }), leadsController.create)
leadsRouter.post('/:id/convert', validate({ params: idParamSchema }), leadsController.convert)
leadsRouter.get('/:id', validate({ params: idParamSchema }), leadsController.getOne)
leadsRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: updateLeadSchema }),
  leadsController.update,
)
leadsRouter.delete('/:id', validate({ params: idParamSchema }), leadsController.remove)
