import './setup.js'
import test from 'node:test'
import assert from 'node:assert/strict'

const { app } = await import('../src/app.js')
const { redactChanges } = await import('../src/utils/auditLog.js')
const { createCallLogSchema } = await import('../src/modules/calllogs/calllogs.validation.js')
const { createFollowUpSchema } = await import('../src/modules/followups/followups.validation.js')

let server
let base
test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => resolve())
  })
  base = `http://127.0.0.1:${server.address().port}`
})
test.after(() => server.close())

test('health endpoint is public and sets security headers', async () => {
  const res = await fetch(`${base}/api/health`)
  assert.equal(res.status, 200)
  assert.ok(res.headers.get('x-content-type-options'))
})

test('protected routes reject missing tokens', async () => {
  for (const path of ['/api/leads', '/api/call-logs', '/api/audit-logs', '/api/notifications']) {
    const res = await fetch(`${base}${path}`)
    assert.equal(res.status, 401, path)
  }
})

test('login validates its body', async () => {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'nope' }),
  })
  assert.equal(res.status, 400)
})

test('unknown routes 404', async () => {
  assert.equal((await fetch(`${base}/api/nope`)).status, 404)
})

test('redactChanges strips credential-like keys, recursively', () => {
  const out = redactChanges({ name: 'a', password: 'x', nested: { apiToken: 'y', ok: 1 }, list: [{ secret: 's' }] })
  assert.deepEqual(out, {
    name: 'a',
    password: '[REDACTED]',
    nested: { apiToken: '[REDACTED]', ok: 1 },
    list: [{ secret: '[REDACTED]' }],
  })
  assert.equal(redactChanges(null), null)
})

test('password policy: length, letter and digit required', async () => {
  const { passwordSchema } = await import('../src/modules/auth/auth.validation.js')
  for (const bad of ['short1', 'allletters', '12345678', 'a1'.repeat(40)]) {
    assert.equal(passwordSchema.safeParse(bad).success, false, bad)
  }
  assert.equal(passwordSchema.safeParse('Passw0rd123').success, true)
})

test('call log and follow-up creation require a linked record', () => {
  assert.equal(createCallLogSchema.safeParse({ outcome: 'CONNECTED' }).success, false)
  assert.equal(
    createCallLogSchema.safeParse({ outcome: 'CONNECTED', leadId: crypto.randomUUID() }).success,
    true,
  )
  assert.equal(createCallLogSchema.safeParse({ outcome: 'BAD', leadId: crypto.randomUUID() }).success, false)
  assert.equal(createFollowUpSchema.safeParse({ scheduledAt: '2026-01-01' }).success, false)
})
