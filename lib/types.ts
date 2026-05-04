export type TaskStatus = 'not_started' | 'in_progress' | 'waiting_review' | 'done'

export type RiskLevel = 'overdue' | 'today' | 'soon' | 'normal'

export interface Event {
  id: string
  name: string
  date: string // ISO date string YYYY-MM-DD
  time: string // HH:MM
  venue: string
  description?: string
  recruitmentStartDate?: string
  recruitmentDeadline?: string
  members: [string, string, string] // exactly 3 members
  googleCalendarEventId?: string
  googleTaskListId?: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  eventId: string
  title: string
  assignee: string | null // member name or null = unassigned
  dueDate: string // ISO date string YYYY-MM-DD
  status: TaskStatus
  memo: string
  templateKey: string
  createdAt: string
  updatedAt: string
}

export interface EventWithStats extends Event {
  totalTasks: number
  incompleteTasks: number
  overdueTasks: number
  unassignedTasks: number
}

export type TaskAssigneeRole = 'member1' | 'member2' | 'member3' | 'unassigned'

export interface TaskTemplate {
  templateKey: string
  title: string
  daysBeforeEvent: number
  assigneeRole: TaskAssigneeRole
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: '未着手',
  in_progress: '進行中',
  waiting_review: '確認待ち',
  done: '完了',
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  not_started: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  waiting_review: 'bg-purple-100 text-purple-700',
  done: 'bg-green-100 text-green-700',
}

// Future: notification timing config for LINE notifications
// - 3 days before due: first reminder
// - 1 day before due: urgent reminder
// - on due date: final reminder
// - 1 day after due (if not done): overdue alert
// - when status changes to waiting_review: notify all members
// - daily digest: list of unassigned + overdue tasks
