import { asyncHandler } from '../../utils/asyncHandler.js'
import * as auditLogsService from './auditlogs.service.js'

export const list = asyncHandler(async (req, res) => {
  res.json(await auditLogsService.listAuditLogs(req.query))
})
