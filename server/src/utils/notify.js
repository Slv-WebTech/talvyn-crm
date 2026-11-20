import { prisma } from '../lib/prisma.js'

// Same fire-and-forget contract as recordAudit: a notification is a
// nice-to-have side effect, never a reason to fail the request that
// triggered it.
export async function notify(userId, type, message, entity = {}) {
  if (!userId) return
  try {
    await prisma.notification.create({
      data: { userId, type, message, entityType: entity.type ?? null, entityId: entity.id ?? null },
    })
  } catch (err) {
    console.error('Failed to create notification:', err)
  }
}
