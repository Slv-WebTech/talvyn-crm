// DB-backed regression tests. They create (and delete) their own QA users/records,
// so they only run when RUN_DB_TESTS=1 and DATABASE_URL points at a disposable database.
//   RUN_DB_TESTS=1 pnpm --filter server test
import test from 'node:test'
import assert from 'node:assert/strict'

const enabled = process.env.RUN_DB_TESTS === '1'
if (enabled) {
  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET ??= 'test-secret-test-secret-1234'
}

test('API business-rule regressions (DB)', { skip: !enabled && 'set RUN_DB_TESTS=1 to run' }, async (t) => {
  const { app } = await import('../src/app.js')
  const { prisma } = await import('../src/lib/prisma.js')
  const { hashPassword } = await import('../src/utils/password.js')

  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s))
  })
  const base = `http://127.0.0.1:${server.address().port}/api`
  const tag = `qa${Date.now()}`
  const call = async (token, method, path, body) => {
    const res = await fetch(base + path, {
      method,
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    })
    let json = null
    try {
      json = await res.json()
    } catch {
      /* empty body */
    }
    return { status: res.status, json }
  }
  const mkUser = async (role, n) => {
    const email = `${tag}.${n}@qa.test`
    const user = await prisma.user.create({
      data: { name: `QA ${n}`, email, role, password: await hashPassword('QaPass1234') },
    })
    const login = await call(null, 'POST', '/auth/login', { email, password: 'QaPass1234' })
    return { ...user, token: login.json.token }
  }

  const admin = await mkUser('ADMIN', 'admin')
  const ex1 = await mkUser('SALES_EXECUTIVE', 'ex1')
  const ex2 = await mkUser('SALES_EXECUTIVE', 'ex2')
  const created = { customers: [], leads: [] }

  try {
    await t.test('malformed JSON returns 400', async () => {
      assert.equal((await call(admin.token, 'POST', '/leads', '{bad')).status, 400)
    })

    const customer = (await call(ex1.token, 'POST', '/customers', { name: 'C', email: `${tag}.c@qa.test` })).json
    created.customers.push(customer.id)

    await t.test('executive cannot reassign an opportunity', async () => {
      const opp = (await call(ex1.token, 'POST', '/opportunities', { title: 'O', customerId: customer.id })).json
      const res = await call(ex1.token, 'PUT', `/opportunities/${opp.id}`, { assignedToId: ex2.id })
      assert.equal(res.status, 403)
    })

    await t.test('opportunity created as WON gets closedAt; re-saving WON keeps it', async () => {
      const opp = (await call(ex1.token, 'POST', '/opportunities', { title: 'W', customerId: customer.id, stage: 'WON', value: 10 })).json
      assert.ok(opp.closedAt)
      const again = (await call(ex1.token, 'PATCH', `/opportunities/${opp.id}/stage`, { stage: 'WON' })).json
      assert.equal(again.closedAt, opp.closedAt)
      const reopened = (await call(ex1.token, 'PATCH', `/opportunities/${opp.id}/stage`, { stage: 'NEGOTIATION' })).json
      assert.equal(reopened.closedAt, null)
    })

    await t.test('foreign-key violations are not 500s', async () => {
      const ghost = '00000000-0000-4000-8000-000000000000'
      const res = await call(admin.token, 'POST', '/opportunities', { title: 'x', customerId: customer.id, assignedToId: ghost })
      assert.ok(res.status < 500)
      assert.equal((await call(ex1.token, 'DELETE', `/customers/${customer.id}`)).status, 409)
    })

    await t.test('lead conversion: concurrent calls create exactly one opportunity; converted lead is frozen', async () => {
      const lead = (await call(ex1.token, 'POST', '/leads', { name: 'L', company: `Co ${tag}`, email: `${tag}.l@qa.test` })).json
      created.leads.push(lead.id)
      const [a, b] = await Promise.all([
        call(ex1.token, 'POST', `/leads/${lead.id}/convert`),
        call(ex1.token, 'POST', `/leads/${lead.id}/convert`),
      ])
      assert.deepEqual([a.status, b.status].sort(), [200, 409])
      const opps = (await call(ex1.token, 'GET', '/opportunities?limit=100')).json.items.filter((o) => o.leadId === lead.id)
      assert.equal(opps.length, 1)
      assert.equal((await call(ex1.token, 'PUT', `/leads/${lead.id}`, { status: 'NEW' })).status, 400)
      assert.equal((await call(ex2.token, 'POST', `/leads/${lead.id}/convert`)).status, 403)
    })

    await t.test('last active admin cannot be demoted or deactivated', async () => {
      // Make `admin` the only active admin by deactivating every other admin temporarily.
      const others = await prisma.user.findMany({ where: { role: 'ADMIN', isActive: true, id: { not: admin.id } }, select: { id: true } })
      await prisma.user.updateMany({ where: { id: { in: others.map((o) => o.id) } }, data: { isActive: false } })
      try {
        assert.equal((await call(admin.token, 'PUT', `/users/${admin.id}`, { role: 'SALES_MANAGER' })).status, 400)
        assert.equal((await call(admin.token, 'DELETE', `/users/${admin.id}`)).status, 400)
      } finally {
        await prisma.user.updateMany({ where: { id: { in: others.map((o) => o.id) } }, data: { isActive: true } })
      }
    })

    await t.test('computed overdue reminders do not keep the unread badge lit', async () => {
      await call(ex1.token, 'POST', '/tasks', { title: 'Late', dueDate: '2020-01-01' })
      await call(ex1.token, 'PATCH', '/notifications/read-all')
      const n = (await call(ex1.token, 'GET', '/notifications')).json
      assert.ok(n.items.some((i) => i.type === 'TASK_OVERDUE'))
      assert.equal(n.unreadCount, 0)
    })

    await t.test('lead conversion refuses another rep\'s existing customer', async () => {
      const email = `${tag}.shared@qa.test`
      const cust = (await call(ex1.token, 'POST', '/customers', { name: 'Shared', email })).json
      created.customers.push(cust.id)
      const lead = (await call(ex2.token, 'POST', '/leads', { name: 'S', company: `Shared ${tag}`, email })).json
      assert.equal((await call(ex2.token, 'POST', `/leads/${lead.id}/convert`)).status, 409)
    })

    await t.test('audit logs never store passwords', async () => {
      await call(admin.token, 'POST', '/users', { name: 'AuditPw', email: `${tag}.aud@qa.test`, password: 'SuperSecret123' })
      const logs = await call(admin.token, 'GET', '/audit-logs?entityType=User&limit=20')
      assert.ok(!JSON.stringify(logs.json).includes('SuperSecret123'))
    })
  } finally {
    const userIds = (await prisma.user.findMany({ where: { email: { startsWith: tag } }, select: { id: true } })).map((u) => u.id)
    await prisma.task.deleteMany({ where: { OR: [{ assignedToId: { in: userIds } }, { createdById: { in: userIds } }] } })
    await prisma.followUp.deleteMany({ where: { assignedToId: { in: userIds } } })
    await prisma.callLog.deleteMany({ where: { assignedToId: { in: userIds } } })
    await prisma.notification.deleteMany({ where: { userId: { in: userIds } } })
    await prisma.auditLog.deleteMany({ where: { userId: { in: userIds } } })
    await prisma.opportunity.deleteMany({ where: { OR: [{ assignedToId: { in: userIds } }, { customer: { email: { startsWith: tag } } }] } })
    await prisma.lead.updateMany({ where: { email: { startsWith: tag } }, data: { convertedToCustomerId: null } })
    await prisma.lead.deleteMany({ where: { email: { startsWith: tag } } })
    await prisma.customer.deleteMany({ where: { email: { startsWith: tag } } })
    await prisma.user.deleteMany({ where: { id: { in: userIds } } })
    await prisma.$disconnect()
    server.close()
  }
})
