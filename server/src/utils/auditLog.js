import { prisma } from '../lib/prisma.js'

const SENSITIVE_KEY = /pass(word)?|token|secret|authorization/i

// Strip credential-like fields before persisting a change set.
export function redactChanges(value) {
  if (Array.isArray(value)) return value.map(redactChanges)
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, SENSITIVE_KEY.test(k) ? '[REDACTED]' : redactChanges(v)]),
    )
  }
  return value
}

// Logging failures must never break the primary action they're attached to,
// so every write here is swallowed and logged to the server console instead
// of thrown. `client` defaults to the singleton but accepts a `tx` so callers
// inside a $transaction can keep the audit row atomic with the rest of it.
export async function recordAudit(user, action, entityType, entityId, changes = null, client = prisma) {
  try {
    await client.auditLog.create({
      data: { action, entityType, entityId, changes: redactChanges(changes), userId: user?.id ?? null },
    })
  } catch (err) {
    console.error('Failed to record audit log:', err)
  }
}
