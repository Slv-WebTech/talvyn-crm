import { asyncHandler } from '../../utils/asyncHandler.js'
import * as dashboardService from './dashboard.service.js'

export const summary = asyncHandler(async (req, res) => {
  res.json(await dashboardService.getSummary(req.user))
})

export const upcomingFollowUps = asyncHandler(async (req, res) => {
  res.json(await dashboardService.getUpcomingFollowUps(req.user))
})

export const revenueTrend = asyncHandler(async (req, res) => {
  res.json(await dashboardService.getRevenueTrend(req.user))
})
