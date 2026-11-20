import 'dotenv/config'

function required(name, fallback) {
  const value = process.env[name] ?? fallback
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  // Set ALLOW_REGISTRATION=false to disable open self-signup (Admins can still create users).
  allowRegistration: (process.env.ALLOW_REGISTRATION ?? 'true').toLowerCase() !== 'false',
  // Set TRUST_PROXY=1 (number of proxy hops) when running behind a reverse proxy/load balancer,
  // so rate limiting and logs see the real client IP.
  trustProxy: process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) : false,
  rateLimitEnabled: process.env.NODE_ENV !== 'test',
}

if (env.jwtSecret.length < 16) {
  throw new Error('JWT_SECRET must be at least 16 characters long')
}

export { required }
