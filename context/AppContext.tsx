'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Event, Task } from '@/lib/types'
import * as storage from '@/lib/storage'
import { generateTasksForEvent } from '@/lib/taskUtils'
import {
  GoogleSession,
  getStoredSession,
  isSessionValid,
  requestGoogleToken,
  clearSession,
} from '@/lib/googleAuth'
import { createCalendarEvent } from '@/lib/googleCalendar'
import { syncMilestonesToTasks } from '@/lib/googleTasks'

interface AppContextValue {
  events: Event[]
  tasks: Task[]
  createEvent: (data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Event
  deleteEvent: (id: string) => void
  updateEvent: (id: string, patch: Partial<Event>) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  getTasksForEvent: (eventId: string) => Task[]
  refreshAll: () => void
  // Google integration
  googleSession: GoogleSession | null
  connectGoogle: () => Promise<void>
  disconnectGoogle: () => void
  syncEventToGoogle: (eventId: string) => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [googleSession, setGoogleSession] = useState<GoogleSession | null>(null)

  const refreshAll = useCallback(() => {
    setEvents(storage.getEvents())
    setTasks(storage.getTasks())
  }, [])

  useEffect(() => {
    refreshAll()
    // Restore Google session from sessionStorage on mount
    if (isSessionValid()) {
      setGoogleSession(getStoredSession())
    }
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

  const updateEvent = useCallback(
    (id: string, patch: Partial<Event>) => {
      storage.updateEvent(id, patch)
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

  const connectGoogle = useCallback(async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID が設定されていません')
    const session = await requestGoogleToken(clientId)
    setGoogleSession(session)
  }, [])

  const disconnectGoogle = useCallback(() => {
    clearSession()
    setGoogleSession(null)
  }, [])

  const syncEventToGoogle = useCallback(
    async (eventId: string): Promise<void> => {
      const session = getStoredSession()
      if (!session || !isSessionValid()) throw new Error('Googleと連携されていません')

      const event = storage.getEvent(eventId)
      if (!event) throw new Error('イベントが見つかりません')

      const [calendarEventId, taskListId] = await Promise.all([
        createCalendarEvent(event, session.accessToken),
        syncMilestonesToTasks(event, session.accessToken),
      ])

      storage.updateEvent(eventId, {
        googleCalendarEventId: calendarEventId,
        googleTaskListId: taskListId,
      })
      refreshAll()
    },
    [refreshAll]
  )

  return (
    <AppContext.Provider
      value={{
        events, tasks,
        createEvent, deleteEvent, updateEvent, updateTask,
        getTasksForEvent, refreshAll,
        googleSession, connectGoogle, disconnectGoogle, syncEventToGoogle,
      }}
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
