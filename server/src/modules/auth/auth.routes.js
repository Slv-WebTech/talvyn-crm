import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { env } from '../../config/env.js'
import { validate } from '../../middleware/validate.js'
import { authenticate } from '../../middleware/auth.js'
import { registerSchema, loginSchema } from './auth.validation.js'
import * as authController from './auth.controller.js'

export const authRouter = Router()

// Brute-force protection on credential endpoints (per IP).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !env.rateLimitEnabled,
  message: { error: { message: 'Too many attempts, please try again later', details: null } },
})

authRouter.post('/register', authLimiter, validate({ body: registerSchema }), authController.register)
authRouter.post('/login', authLimiter, validate({ body: loginSchema }), authController.login)
authRouter.get('/me', authenticate, authController.me)
