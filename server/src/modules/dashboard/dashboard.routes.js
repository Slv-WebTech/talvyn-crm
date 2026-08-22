import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import * as dashboardController from './dashboard.controller.js'

export const dashboardRouter = Router()

dashboardRouter.use(authenticate)

dashboardRouter.get('/summary', dashboardController.summary)
dashboardRouter.get('/upcoming-followups', dashboardController.upcomingFollowUps)
dashboardRouter.get('/revenue-trend', dashboardController.revenueTrend)
