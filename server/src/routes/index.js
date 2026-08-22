import { Router } from 'express'
import { authRouter } from '../modules/auth/auth.routes.js'
import { usersRouter } from '../modules/users/users.routes.js'
import { customersRouter } from '../modules/customers/customers.routes.js'
import { leadsRouter } from '../modules/leads/leads.routes.js'
import { opportunitiesRouter } from '../modules/opportunities/opportunities.routes.js'
import { followUpsRouter } from '../modules/followups/followups.routes.js'
import { tasksRouter } from '../modules/tasks/tasks.routes.js'
import { dashboardRouter } from '../modules/dashboard/dashboard.routes.js'

export const apiRouter = Router()

apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

apiRouter.use('/auth', authRouter)
apiRouter.use('/users', usersRouter)
apiRouter.use('/customers', customersRouter)
apiRouter.use('/leads', leadsRouter)
apiRouter.use('/opportunities', opportunitiesRouter)
apiRouter.use('/followups', followUpsRouter)
apiRouter.use('/tasks', tasksRouter)
apiRouter.use('/dashboard', dashboardRouter)
