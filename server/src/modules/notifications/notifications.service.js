import { prisma } from '../../lib/prisma.js'
import { ApiError } from '../../utils/ApiError.js'

const UPCOMING_WINDOW_MS = 24 * 60 * 60 * 1000

// Event-driven notifications (lead assigned, task assigned, deal stage
// changed) are persisted rows. Time-based ones (upcoming follow-up, overdue
// task) are computed at read-time instead — no scheduler/cron needed, and
// they naturally disappear once the underlying record is resolved.
export async function listNotifications(user) {
  const persisted = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const now = new Date()
  const upcomingWindow = new Date(now.getTime() + UPCOMING_WINDOW_MS)

  const [upcomingFollowUps, overdueTasks] = await Promise.all([
    prisma.followUp.findMany({
      where: { assignedToId: user.id, status: 'PENDING', scheduledAt: { gte: now, lte: upcomingWindow } },
      orderBy: { scheduledAt: 'asc' },
      take: 20,
    }),
    prisma.task.findMany({
      where: { assignedToId: user.id, status: { not: 'COMPLETED' }, dueDate: { lt: now } },
      orderBy: { dueDate: 'asc' },
      take: 20,
    }),
  ])

  const virtual = [
    ...upcomingFollowUps.map((f) => ({
      id: `followup-${f.id}`,
      type: 'FOLLOWUP_UPCOMING',
      message: `Upcoming ${f.type.toLowerCase()} follow-up scheduled ${f.scheduledAt.toLocaleString()}`,
      read: false,
      virtual: true,
      entityType: 'followup',
      entityId: f.id,
      createdAt: f.scheduledAt,
    })),
    ...overdueTasks.map((t) => ({
      id: `task-${t.id}`,
      type: 'TASK_OVERDUE',
      message: `Overdue task: ${t.title}`,
      read: false,
      virtual: true,
      entityType: 'task',
      entityId: t.id,
      createdAt: t.dueDate,
    })),
  ]

  const items = [...persisted, ...virtual].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  // Computed reminders (overdue task / upcoming follow-up) can't be "read": they
  // disappear when the underlying record is resolved. Keep them listed but out
  // of the badge so it can reach 0 after "Mark all read".
  const unreadCount = persisted.filter((n) => !n.read).length

  return { items, unreadCount }
}

export async function markAsRead(user, id) {
  const notification = await prisma.notification.findUnique({ where: { id } })
  if (!notification) throw new ApiError(404, 'Notification not found')
  if (notification.userId !== user.id) throw new ApiError(403, 'You do not have access to this notification')
  return prisma.notification.update({ where: { id }, data: { read: true, readAt: new Date() } })
}

export async function markAllAsRead(user) {
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true, readAt: new Date() },
  })
}
