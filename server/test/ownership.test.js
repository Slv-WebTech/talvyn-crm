import './setup.js'
import test from 'node:test'
import assert from 'node:assert/strict'

const { scopeToOwner, assertOwnership, isElevated } = await import('../src/utils/ownership.js')

const exec = { id: 'u1', role: 'SALES_EXECUTIVE' }
const manager = { id: 'u2', role: 'SALES_MANAGER' }
const admin = { id: 'u3', role: 'ADMIN' }

test('isElevated: only admin and manager', () => {
  assert.equal(isElevated(admin), true)
  assert.equal(isElevated(manager), true)
  assert.equal(isElevated(exec), false)
})

test('scopeToOwner restricts executives to their own rows', () => {
  assert.deepEqual(scopeToOwner(exec), { assignedToId: 'u1' })
  assert.deepEqual(scopeToOwner(exec, 'ownerId'), { ownerId: 'u1' })
  assert.deepEqual(scopeToOwner(admin), {})
  assert.deepEqual(scopeToOwner(manager), {})
})

test('assertOwnership blocks executives from other reps records', () => {
  assert.throws(() => assertOwnership(exec, { assignedToId: 'other' }), { statusCode: 403 })
  assert.doesNotThrow(() => assertOwnership(exec, { assignedToId: 'u1' }))
  assert.doesNotThrow(() => assertOwnership(admin, { assignedToId: 'other' }))
})
