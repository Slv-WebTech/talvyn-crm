import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { authenticate } from '../../middleware/auth.js'
import {
  idParamSchema,
  listQuerySchema,
  createOpportunitySchema,
  updateOpportunitySchema,
  stageUpdateSchema,
} from './opportunities.validation.js'
import * as opportunitiesController from './opportunities.controller.js'

export const opportunitiesRouter = Router()

opportunitiesRouter.use(authenticate)

opportunitiesRouter.get('/', validate({ query: listQuerySchema }), opportunitiesController.list)
opportunitiesRouter.post(
  '/',
  validate({ body: createOpportunitySchema }),
  opportunitiesController.create,
)
opportunitiesRouter.get(
  '/:id',
  validate({ params: idParamSchema }),
  opportunitiesController.getOne,
)
opportunitiesRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: updateOpportunitySchema }),
  opportunitiesController.update,
)
opportunitiesRouter.patch(
  '/:id/stage',
  validate({ params: idParamSchema, body: stageUpdateSchema }),
  opportunitiesController.updateStage,
)
opportunitiesRouter.delete(
  '/:id',
  validate({ params: idParamSchema }),
  opportunitiesController.remove,
)
