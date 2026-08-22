import { asyncHandler } from '../../utils/asyncHandler.js'
import * as followUpsService from './followups.service.js'

export const list = asyncHandler(async (req, res) => {
  res.json(await followUpsService.listFollowUps(req.user, req.query))
})

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await followUpsService.createFollowUp(req.user, req.body))
})

export const getOne = asyncHandler(async (req, res) => {
  res.json(await followUpsService.getFollowUpById(req.user, req.params.id))
})

export const update = asyncHandler(async (req, res) => {
  res.json(await followUpsService.updateFollowUp(req.user, req.params.id, req.body))
})

export const complete = asyncHandler(async (req, res) => {
  res.json(await followUpsService.completeFollowUp(req.user, req.params.id))
})

export const remove = asyncHandler(async (req, res) => {
  await followUpsService.deleteFollowUp(req.user, req.params.id)
  res.status(204).send()
})
