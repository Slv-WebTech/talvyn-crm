import './setup.js'
import test from 'node:test'
import assert from 'node:assert/strict'

const { errorHandler } = await import('../src/middleware/errorHandler.js')
const { ApiError } = await import('../src/utils/ApiError.js')

function run(err) {
  let status
  let body
  const res = {
    status(s) {
      status = s
      return this
    },
    json(b) {
      body = b
    },
  }
  const origError = console.error
  console.error = () => {}
  try {
    errorHandler(err, {}, res, () => {})
  } finally {
    console.error = origError
  }
  return { status, body }
}

test('ApiError keeps its status', () => {
  assert.equal(run(new ApiError(403, 'nope')).status, 403)
})

test('malformed JSON (body-parser 400) is a 400, not a 500', () => {
  const err = Object.assign(new SyntaxError('bad'), { status: 400, expose: true, type: 'entity.parse.failed' })
  assert.equal(run(err).status, 400)
})

test('oversized body is a 413', () => {
  const err = Object.assign(new Error('big'), { status: 413, expose: true, type: 'entity.too.large' })
  assert.equal(run(err).status, 413)
})

test('prisma unique / foreign-key / not-found map to 409 / 409 / 404', () => {
  assert.equal(run(Object.assign(new Error(), { code: 'P2002', meta: {} })).status, 409)
  assert.equal(run(Object.assign(new Error(), { code: 'P2003' })).status, 409)
  assert.equal(run(Object.assign(new Error(), { code: 'P2025' })).status, 404)
})

test('unknown errors are masked as 500', () => {
  const { status, body } = run(new Error('secret db detail'))
  assert.equal(status, 500)
  assert.equal(body.error.message, 'Internal server error')
})
