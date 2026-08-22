import { asyncHandler } from '../../utils/asyncHandler.js'
import * as leadsService from './leads.service.js'

export const list = asyncHandler(async (req, res) => {
  res.json(await leadsService.listLeads(req.user, req.query))
})

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await leadsService.createLead(req.user, req.body))
})

export const getOne = asyncHandler(async (req, res) => {
  res.json(await leadsService.getLeadById(req.user, req.params.id))
})

export const update = asyncHandler(async (req, res) => {
  res.json(await leadsService.updateLead(req.user, req.params.id, req.body))
})

export const remove = asyncHandler(async (req, res) => {
  await leadsService.deleteLead(req.user, req.params.id)
  res.status(204).send()
})

export const convert = asyncHandler(async (req, res) => {
  res.json(await leadsService.convertLead(req.user, req.params.id))
})
