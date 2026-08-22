import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { authenticate } from '../../middleware/auth.js'
import { registerSchema, loginSchema } from './auth.validation.js'
import * as authController from './auth.controller.js'

export const authRouter = Router()

authRouter.post('/register', validate({ body: registerSchema }), authController.register)
authRouter.post('/login', validate({ body: loginSchema }), authController.login)
authRouter.get('/me', authenticate, authController.me)
