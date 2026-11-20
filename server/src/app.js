import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import { env } from './config/env.js'
import { apiRouter } from './routes/index.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'

export const app = express()

if (env.trustProxy) app.set('trust proxy', env.trustProxy)
app.use(helmet())
app.use(cors({ origin: env.clientUrl }))
app.use(express.json({ limit: '100kb' }))
if (env.nodeEnv !== 'test') app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'))

app.use('/api', apiRouter)

app.use(notFound)
app.use(errorHandler)
