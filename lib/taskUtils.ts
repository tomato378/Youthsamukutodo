import { differenceInCalendarDays, parseISO, subDays, format } from 'date-fns'
import { Event, Task, TaskAssigneeRole, RiskLevel } from './types'
import { TASK_TEMPLATES } from './taskTemplates'
import { nanoid } from './nanoid'

export function getRiskLevel(task: Task): RiskLevel {
  if (task.status === 'done') return 'normal'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = parseISO(task.dueDate)
  due.setHours(0, 0, 0, 0)
  const diff = differenceInCalendarDays(due, today)
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  if (diff <= 3) return 'soon'
  return 'normal'
}

export function isOverdue(task: Task): boolean {
  return getRiskLevel(task) === 'overdue'
}

export function isDueToday(task: Task): boolean {
  return getRiskLevel(task) === 'today'
}

export function isDueSoon(task: Task): boolean {
  return getRiskLevel(task) === 'soon'
}

export function isUnassigned(task: Task): boolean {
  return task.assignee === null
}

export function isWaitingReview(task: Task): boolean {
  return task.status === 'waiting_review'
}

export function getRiskBadgeClass(level: RiskLevel): string {
  switch (level) {
    case 'overdue': return 'bg-red-100 text-red-700 border border-red-200'
    case 'today': return 'bg-orange-100 text-orange-700 border border-orange-200'
    case 'soon': return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
    default: return ''
  }
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'overdue': return '期限切れ'
    case 'today': return '今日まで'
    case 'soon': return '3日以内'
    default: return ''
  }
}

export function resolveDueDate(eventDate: string, daysBeforeEvent: number): string {
  const due = subDays(parseISO(eventDate), daysBeforeEvent)
  return format(due, 'yyyy-MM-dd')
}

export function resolveAssignee(
  role: TaskAssigneeRole,
  members: [string, string, string]
): string | null {
  if (role === 'member1') return members[0] || null
  if (role === 'member2') return members[1] || null
  if (role === 'member3') return members[2] || null
  return null
}

export function generateTasksForEvent(event: Event): Omit<Task, 'id'>[] {
  const now = new Date().toISOString()
  return TASK_TEMPLATES.map((template) => ({
    eventId: event.id,
    title: template.title,
    assignee: resolveAssignee(template.assigneeRole, event.members),
    dueDate: resolveDueDate(event.date, template.daysBeforeEvent),
    status: 'not_started' as const,
    memo: '',
    templateKey: template.templateKey,
    createdAt: now,
    updatedAt: now,
  }))
}

export function countDaysUntilEvent(eventDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = parseISO(eventDate)
  date.setHours(0, 0, 0, 0)
  return differenceInCalendarDays(date, today)
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'yyyy年M月d日')
  } catch {
    return dateStr
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'M/d')
  } catch {
    return dateStr
  }
}
