// Loaded first by each test file so config/env.js sees valid values.
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test?schema=public'
process.env.JWT_SECRET ??= 'test-secret-test-secret-1234'
