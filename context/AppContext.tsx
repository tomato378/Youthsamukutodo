'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Event, Task } from '@/lib/types'
import * as storage from '@/lib/storage'
import { generateTasksForEvent } from '@/lib/taskUtils'

interface AppContextValue {
  events: Event[]
  tasks: Task[]
  createEvent: (data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Event
  deleteEvent: (id: string) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  getTasksForEvent: (eventId: string) => Task[]
  refreshAll: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  const refreshAll = useCallback(() => {
    setEvents(storage.getEvents())
    setTasks(storage.getTasks())
  }, [])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  const createEvent = useCallback(
    (data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Event => {
      const event = storage.createEvent(data)
      const generatedTasks = generateTasksForEvent(event)
      storage.bulkCreateTasks(generatedTasks)
      refreshAll()
      return event
    },
    [refreshAll]
  )

  const deleteEvent = useCallback(
    (id: string) => {
      storage.deleteEvent(id)
      refreshAll()
    },
    [refreshAll]
  )

  const updateTask = useCallback(
    (id: string, patch: Partial<Task>) => {
      storage.updateTask(id, patch)
      refreshAll()
    },
    [refreshAll]
  )

  const getTasksForEvent = useCallback(
    (eventId: string): Task[] => tasks.filter((t) => t.eventId === eventId),
    [tasks]
  )

  return (
    <AppContext.Provider
      value={{ events, tasks, createEvent, deleteEvent, updateTask, getTasksForEvent, refreshAll }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
