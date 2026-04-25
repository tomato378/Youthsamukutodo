'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { Task } from '@/lib/types'
import {
  isOverdue,
  isDueToday,
  isDueSoon,
  isUnassigned,
  isWaitingReview,
  formatDateShort,
  countDaysUntilEvent,
} from '@/lib/taskUtils'
import StatsCard from './StatsCard'
import TaskStatusBadge from '@/components/tasks/TaskStatusBadge'
import TaskEditModal from '@/components/tasks/TaskEditModal'
import { Plus, CalendarDays, AlertTriangle, User, Calendar, ChevronRight } from 'lucide-react'

type FilterKey = 'overdue' | 'today' | 'soon' | 'unassigned' | 'review' | null

export default function DashboardClient() {
  const { events, tasks, updateTask } = useApp()
  const [activeFilter, setActiveFilter] = useState<FilterKey>(null)
  const [editing, setEditing] = useState<Task | null>(null)

  const activeTasks = tasks.filter((t) => t.status !== 'done')

  const overdue = activeTasks.filter(isOverdue)
  const today = activeTasks.filter(isDueToday)
  const soon = activeTasks.filter(isDueSoon)
  const unassigned = activeTasks.filter(isUnassigned)
  const review = tasks.filter(isWaitingReview)

  function getFilteredTasks(): Task[] {
    switch (activeFilter) {
      case 'overdue': return overdue
      case 'today': return today
      case 'soon': return soon
      case 'unassigned': return unassigned
      case 'review': return review
      default: return []
    }
  }

  const filteredTasks = getFilteredTasks()

  function getMembersForTask(task: Task): string[] {
    const event = events.find((e) => e.id === task.eventId)
    return event ? event.members : []
  }

  function getAllMembersForTask(task: Task): string[] {
    return getMembersForTask(task)
  }

  function getEventName(eventId: string): string {
    return events.find((e) => e.id === eventId)?.name ?? '不明なイベント'
  }

  const statsConfig = [
    {
      key: 'overdue' as FilterKey,
      icon: '🔴',
      label: '期限切れ',
      count: overdue.length,
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      key: 'today' as FilterKey,
      icon: '🟠',
      label: '今日まで',
      count: today.length,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      key: 'soon' as FilterKey,
      icon: '🟡',
      label: '3日以内',
      count: soon.length,
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    {
      key: 'unassigned' as FilterKey,
      icon: '🟣',
      label: '未担当',
      count: unassigned.length,
      color: 'text-violet-700',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
    },
    {
      key: 'review' as FilterKey,
      icon: '🔵',
      label: '確認待ち',
      count: review.length,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
  ]

  if (events.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="text-6xl mb-4">🌏</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">イベントがまだありません</h2>
          <p className="text-slate-500 mb-8">
            最初のイベントを作成して、準備タスクを自動生成しましょう
          </p>
          <Link
            href="/events/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
          >
            <Plus size={18} />
            最初のイベントを作成する
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Stats grid */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          全イベント横断 — 要確認タスク
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {statsConfig.map((s) => (
            <StatsCard
              key={s.key}
              icon={s.icon}
              label={s.label}
              count={s.count}
              color={s.color}
              bgColor={s.bgColor}
              borderColor={s.borderColor}
              onClick={() => setActiveFilter(activeFilter === s.key ? null : s.key)}
            />
          ))}
        </div>
      </section>

      {/* Filtered task list */}
      {activeFilter && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">
              {statsConfig.find((s) => s.key === activeFilter)?.icon}{' '}
              {statsConfig.find((s) => s.key === activeFilter)?.label} タスク一覧
            </h2>
            <button
              onClick={() => setActiveFilter(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              閉じる
            </button>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-slate-200">
              該当タスクなし
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
              {filteredTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setEditing(task)}
                  className="w-full text-left flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs text-indigo-500 font-medium">
                        {getEventName(task.eventId)}
                      </span>
                      <TaskStatusBadge status={task.status} />
                    </div>
                    <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <User size={11} />
                        {task.assignee ?? <span className="text-violet-500">未担当</span>}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDateShort(task.dueDate)}
                      </span>
                    </div>
                  </div>
                  <AlertTriangle size={14} className="text-slate-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Event list */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            イベント一覧
          </h2>
          <Link href="/events" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            すべて見る <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.slice(0, 6).map((event) => {
            const eventTasks = tasks.filter((t) => t.eventId === event.id)
            const daysLeft = countDaysUntilEvent(event.date)
            const overdueCnt = eventTasks.filter((t) => isOverdue(t) && t.status !== 'done').length
            const unassignedCnt = eventTasks.filter((t) => isUnassigned(t) && t.status !== 'done').length
            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-sm transition-all p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900 text-sm leading-snug">{event.name}</h3>
                  {overdueCnt > 0 && (
                    <span className="flex-shrink-0 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                      {overdueCnt}件期限切れ
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <CalendarDays size={12} />
                  {daysLeft < 0 ? '終了済み' : daysLeft === 0 ? '本日開催' : `あと${daysLeft}日`}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{
                        width: `${eventTasks.length ? (eventTasks.filter((t) => t.status === 'done').length / eventTasks.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">
                    {eventTasks.filter((t) => t.status === 'done').length}/{eventTasks.length}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
        <div className="mt-4">
          <Link
            href="/events/new"
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-xl transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            新しいイベントを作成
          </Link>
        </div>
      </section>

      {editing && (
        <TaskEditModal
          task={editing}
          members={getAllMembersForTask(editing)}
          onSave={updateTask}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
