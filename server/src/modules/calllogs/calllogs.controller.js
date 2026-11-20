import { asyncHandler } from '../../utils/asyncHandler.js'
import * as callLogsService from './calllogs.service.js'

export const list = asyncHandler(async (req, res) => {
  res.json(await callLogsService.listCallLogs(req.user, req.query))
})

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await callLogsService.createCallLog(req.user, req.body))
})

export const getOne = asyncHandler(async (req, res) => {
  res.json(await callLogsService.getCallLogById(req.user, req.params.id))
})

export const update = asyncHandler(async (req, res) => {
  res.json(await callLogsService.updateCallLog(req.user, req.params.id, req.body))
})

export const remove = asyncHandler(async (req, res) => {
  await callLogsService.deleteCallLog(req.user, req.params.id)
  res.status(204).send()
})
