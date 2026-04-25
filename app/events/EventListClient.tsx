'use client'

import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import EventCard from '@/components/events/EventCard'
import { EventWithStats } from '@/lib/types'
import { isOverdue, isUnassigned } from '@/lib/taskUtils'
import { Plus } from 'lucide-react'

export default function EventListClient() {
  const { events, tasks } = useApp()

  const eventsWithStats: EventWithStats[] = events.map((event) => {
    const eventTasks = tasks.filter((t) => t.eventId === event.id)
    return {
      ...event,
      totalTasks: eventTasks.length,
      incompleteTasks: eventTasks.filter((t) => t.status !== 'done').length,
      overdueTasks: eventTasks.filter((t) => isOverdue(t) && t.status !== 'done').length,
      unassignedTasks: eventTasks.filter((t) => isUnassigned(t) && t.status !== 'done').length,
    }
  })

  if (eventsWithStats.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">📅</div>
        <h2 className="text-lg font-semibold text-slate-700 mb-2">イベントがありません</h2>
        <p className="text-slate-400 text-sm mb-8">最初のイベントを作成しましょう</p>
        <Link
          href="/events/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
        >
          <Plus size={18} />
          イベントを作成する
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {eventsWithStats.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        <Link
          href="/events/new"
          className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all"
        >
          <Plus size={28} />
          <span className="text-sm font-medium">新しいイベントを作成</span>
        </Link>
      </div>
    </div>
  )
}
