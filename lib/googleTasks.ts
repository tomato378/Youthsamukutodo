import { Event } from './types'
import { getPromotionalSchedule, PromotionalMilestone } from './scheduleUtils'

async function createTaskList(name: string, token: string): Promise<string> {
  const res = await fetch('https://www.googleapis.com/tasks/v1/users/@me/lists', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: name }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Google Tasks API エラー: ${err?.error?.message ?? res.status}`)
  }

  const data = await res.json()
  return data.id as string
}

async function addMilestoneTask(
  milestone: PromotionalMilestone & { isPast: boolean; isToday: boolean },
  taskListId: string,
  token: string,
): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `${milestone.icon} ${milestone.label}`,
      notes: milestone.sublabel,
      due: `${milestone.date}T00:00:00.000Z`,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Google Tasks API エラー: ${err?.error?.message ?? res.status}`)
  }
}

export async function syncMilestonesToTasks(event: Event, token: string): Promise<string> {
  const milestones = getPromotionalSchedule(event.date)
  const taskListId = await createTaskList(event.name, token)
  await Promise.all(milestones.map((m) => addMilestoneTask(m, taskListId, token)))
  return taskListId
}
