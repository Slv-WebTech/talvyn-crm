import { asyncHandler } from '../../utils/asyncHandler.js'
import * as notificationsService from './notifications.service.js'

export const list = asyncHandler(async (req, res) => {
  res.json(await notificationsService.listNotifications(req.user))
})

export const markRead = asyncHandler(async (req, res) => {
  res.json(await notificationsService.markAsRead(req.user, req.params.id))
})

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationsService.markAllAsRead(req.user)
  res.status(204).send()
})
