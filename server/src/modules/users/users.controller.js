import { asyncHandler } from '../../utils/asyncHandler.js'
import * as usersService from './users.service.js'

export const list = asyncHandler(async (req, res) => {
  res.json(await usersService.listUsers())
})

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await usersService.createUser(req.body))
})

export const getOne = asyncHandler(async (req, res) => {
  res.json(await usersService.getUserById(req.params.id))
})

export const update = asyncHandler(async (req, res) => {
  res.json(await usersService.updateUser(req.params.id, req.body))
})

export const deactivate = asyncHandler(async (req, res) => {
  res.json(await usersService.deactivateUser(req.params.id))
})
