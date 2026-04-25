'use client'

/**
 * localStorage-based data store for MVP.
 *
 * Migration path to Supabase:
 * 1. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 * 2. Run the schema in supabase/schema.sql
 * 3. Replace this module with a Supabase client implementation
 *    (the function signatures stay the same)
 *
 * Future: When adding LINE notifications, use Supabase Edge Functions
 * triggered by database webhooks on task status changes and due-date checks.
 */

import { Event, Task } from './types'
import { nanoid } from './nanoid'

const EVENTS_KEY = 'youthsamuku_events'
const TASKS_KEY = 'youthsamuku_tasks'

function getAll<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]
  } catch {
    return []
  }
}

function saveAll<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

// ─── Events ────────────────────────────────────────────────────────────────

export function getEvents(): Event[] {
  return getAll<Event>(EVENTS_KEY)
}

export function getEvent(id: string): Event | undefined {
  return getAll<Event>(EVENTS_KEY).find((e) => e.id === id)
}

export function createEvent(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Event {
  const now = new Date().toISOString()
  const event: Event = { ...data, id: nanoid(), createdAt: now, updatedAt: now }
  const events = getAll<Event>(EVENTS_KEY)
  saveAll(EVENTS_KEY, [...events, event])
  return event
}

export function updateEvent(id: string, patch: Partial<Event>): Event | undefined {
  const events = getAll<Event>(EVENTS_KEY)
  const idx = events.findIndex((e) => e.id === id)
  if (idx === -1) return undefined
  events[idx] = { ...events[idx], ...patch, id, updatedAt: new Date().toISOString() }
  saveAll(EVENTS_KEY, events)
  return events[idx]
}

export function deleteEvent(id: string): void {
  const events = getAll<Event>(EVENTS_KEY).filter((e) => e.id !== id)
  saveAll(EVENTS_KEY, events)
  // cascade: delete related tasks
  const tasks = getAll<Task>(TASKS_KEY).filter((t) => t.eventId !== id)
  saveAll(TASKS_KEY, tasks)
}

// ─── Tasks ──────────────────────────────────────────────────────────────────

export function getTasks(eventId?: string): Task[] {
  const tasks = getAll<Task>(TASKS_KEY)
  return eventId ? tasks.filter((t) => t.eventId === eventId) : tasks
}

export function createTask(data: Omit<Task, 'id'>): Task {
  const task: Task = { ...data, id: nanoid() }
  const tasks = getAll<Task>(TASKS_KEY)
  saveAll(TASKS_KEY, [...tasks, task])
  return task
}

export function bulkCreateTasks(data: Omit<Task, 'id'>[]): Task[] {
  const newTasks: Task[] = data.map((d) => ({ ...d, id: nanoid() }))
  const tasks = getAll<Task>(TASKS_KEY)
  saveAll(TASKS_KEY, [...tasks, ...newTasks])
  return newTasks
}

export function updateTask(id: string, patch: Partial<Task>): Task | undefined {
  const tasks = getAll<Task>(TASKS_KEY)
  const idx = tasks.findIndex((t) => t.id === id)
  if (idx === -1) return undefined
  tasks[idx] = { ...tasks[idx], ...patch, id, updatedAt: new Date().toISOString() }
  saveAll(TASKS_KEY, tasks)
  return tasks[idx]
}
