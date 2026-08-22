import { asyncHandler } from '../../utils/asyncHandler.js'
import * as tasksService from './tasks.service.js'

export const list = asyncHandler(async (req, res) => {
  res.json(await tasksService.listTasks(req.user, req.query))
})

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await tasksService.createTask(req.user, req.body))
})

export const getOne = asyncHandler(async (req, res) => {
  res.json(await tasksService.getTaskById(req.user, req.params.id))
})

export const update = asyncHandler(async (req, res) => {
  res.json(await tasksService.updateTask(req.user, req.params.id, req.body))
})

export const updateStatus = asyncHandler(async (req, res) => {
  res.json(await tasksService.updateTaskStatus(req.user, req.params.id, req.body.status))
})

export const remove = asyncHandler(async (req, res) => {
  await tasksService.deleteTask(req.user, req.params.id)
  res.status(204).send()
})
