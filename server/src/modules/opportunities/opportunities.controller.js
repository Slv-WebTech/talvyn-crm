import { asyncHandler } from '../../utils/asyncHandler.js'
import * as opportunitiesService from './opportunities.service.js'

export const list = asyncHandler(async (req, res) => {
  res.json(await opportunitiesService.listOpportunities(req.user, req.query))
})

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await opportunitiesService.createOpportunity(req.user, req.body))
})

export const getOne = asyncHandler(async (req, res) => {
  res.json(await opportunitiesService.getOpportunityById(req.user, req.params.id))
})

export const update = asyncHandler(async (req, res) => {
  res.json(await opportunitiesService.updateOpportunity(req.user, req.params.id, req.body))
})

export const updateStage = asyncHandler(async (req, res) => {
  res.json(await opportunitiesService.updateOpportunityStage(req.user, req.params.id, req.body.stage))
})

export const remove = asyncHandler(async (req, res) => {
  await opportunitiesService.deleteOpportunity(req.user, req.params.id)
  res.status(204).send()
})
