import { asyncHandler } from '../../utils/asyncHandler.js'
import * as customersService from './customers.service.js'

export const list = asyncHandler(async (req, res) => {
  res.json(await customersService.listCustomers(req.user, req.query))
})

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await customersService.createCustomer(req.user, req.body))
})

export const getOne = asyncHandler(async (req, res) => {
  res.json(await customersService.getCustomerById(req.user, req.params.id))
})

export const update = asyncHandler(async (req, res) => {
  res.json(await customersService.updateCustomer(req.user, req.params.id, req.body))
})

export const remove = asyncHandler(async (req, res) => {
  await customersService.deleteCustomer(req.user, req.params.id)
  res.status(204).send()
})

export const opportunities = asyncHandler(async (req, res) => {
  res.json(await customersService.getCustomerOpportunities(req.user, req.params.id))
})
