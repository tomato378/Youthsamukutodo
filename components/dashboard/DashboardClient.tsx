'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { Task } from '@/lib/types'
import {
  isOverdue, isDueToday, isDueSoon, isUnassigned, isWaitingReview,
  formatDateShort, countDaysUntilEvent,
} from '@/lib/taskUtils'
import TaskStatusBadge from '@/components/tasks/TaskStatusBadge'
import TaskEditModal from '@/components/tasks/TaskEditModal'
import { Plus, CalendarDays, User, Calendar, ChevronRight } from 'lucide-react'

interface DangerSection {
  key: string
  icon: string
  label: string
  color: string
  bgColor: string
  borderColor: string
  leftBorder: string
  filter: (t: Task) => boolean
}

const SECTIONS: DangerSection[] = [
  { key: 'overdue', icon: '🔴', label: '期限切れ', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200', leftBorder: '#ef4444', filter: (t) => isOverdue(t) && t.status !== 'done' },
  { key: 'today',   icon: '🟠', label: '今日まで', color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', leftBorder: '#f97316', filter: (t) => isDueToday(t) && t.status !== 'done' },
  { key: 'soon',    icon: '🟡', label: '3日以内',  color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', leftBorder: '#eab308', filter: (t) => isDueSoon(t) && t.status !== 'done' },
  { key: 'unassigned', icon: '🟣', label: '未担当', color: 'text-violet-700', bgColor: 'bg-violet-50', borderColor: 'border-violet-200', leftBorder: '#8b5cf6', filter: (t) => isUnassigned(t) && t.status !== 'done' },
  { key: 'review',  icon: '🔵', label: '確認待ち', color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', leftBorder: '#3b82f6', filter: isWaitingReview },
]

export default function DashboardClient() {
  const { events, tasks, updateTask } = useApp()
  const [editing, setEditing] = useState<Task | null>(null)

  const activeTasks = tasks.filter((t) => t.status !== 'done')
  const sectionCounts = SECTIONS.map((s) => ({
    key: s.key,
    count: tasks.filter(s.filter).length,
  }))

  const allDangerTasks = tasks.filter(
    (t) => t.status !== 'done' && SECTIONS.slice(0, 4).some((s) => s.filter(t))
    || isWaitingReview(t)
  )

  function getEventName(eventId: string) {
    return events.find((e) => e.id === eventId)?.name ?? '不明'
  }

  function getMembersForTask(task: Task): string[] {
    return events.find((e) => e.id === task.eventId)?.members ?? []
  }

  function getDangerBorderColor(task: Task): string {
    if (isOverdue(task)) return '#ef4444'
    if (isDueToday(task)) return '#f97316'
    if (isDueSoon(task)) return '#eab308'
    if (isUnassigned(task)) return '#8b5cf6'
    return '#3b82f6'
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🌏</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">イベントがまだありません</h2>
        <p className="text-slate-500 mb-8">最初のイベントを作成して、準備タスクを自動生成しましょう</p>
        <Link
          href="/events/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
        >
          <Plus size={18} />
          最初のイベントを作成する
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* ─── Summary cards ─── */}
      <section className="mb-8">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          ⚡ 危険タスクサマリー — 今すぐ対応が必要なタスク数
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {SECTIONS.map((s, i) => (
            <div
              key={s.key}
              className={`flex flex-col items-center justify-center gap-1 p-3 sm:p-4 rounded-2xl border-2 ${s.bgColor} ${s.borderColor}`}
            >
              <span className="text-xl sm:text-2xl">{s.icon}</span>
              <span className={`text-2xl sm:text-3xl font-bold leading-none ${s.color}`}>
                {sectionCounts[i].count}
              </span>
              <span className={`text-[11px] sm:text-xs font-medium ${s.color}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Danger task table (desktop) ─── */}
      {allDangerTasks.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">🚨 危険タスク一覧</h2>

          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
                  <th className="text-left py-3 px-4 font-semibold">タスク名</th>
                  <th className="text-left py-3 px-4 font-semibold">イベント</th>
                  <th className="text-left py-3 px-4 font-semibold">担当者</th>
                  <th className="text-left py-3 px-4 font-semibold">期限</th>
                  <th className="text-left py-3 px-4 font-semibold">状態</th>
                </tr>
              </thead>
              <tbody>
                {allDangerTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => setEditing(task)}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-slate-800">{task.title}</td>
                    <td className="py-3 px-4 text-xs text-indigo-600 font-medium">{getEventName(task.eventId)}</td>
                    <td className="py-3 px-4">
                      {task.assignee ? (
                        <span className="flex items-center gap-1.5 text-sm">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                            {task.assignee[0]}
                          </span>
                          {task.assignee}
                        </span>
                      ) : (
                        <span className="text-xs text-violet-600 font-medium flex items-center gap-1">
                          <User size={11} /> 未担当
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 flex items-center gap-1">
                      <Calendar size={11} /> {formatDateShort(task.dueDate)}
                    </td>
                    <td className="py-3 px-4">
                      <TaskStatusBadge status={task.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards with left-border accent */}
          <div className="sm:hidden space-y-2">
            <p className="text-xs text-slate-400 mb-2">今すぐ対応</p>
            {allDangerTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setEditing(task)}
                className="w-full text-left bg-white rounded-xl border border-slate-200 p-3.5 hover:shadow-sm transition-shadow"
                style={{ borderLeft: `3px solid ${getDangerBorderColor(task)}` }}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-sm font-bold text-slate-800 leading-snug">{task.title}</span>
                  <TaskStatusBadge status={task.status} />
                </div>
                <div className="text-xs text-indigo-500 font-medium mb-1">{getEventName(task.eventId)}</div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <User size={11} />
                    {task.assignee ?? <span className="text-violet-500">未担当</span>}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} /> 期限: {formatDateShort(task.dueDate)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ─── Upcoming events ─── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            📅 近日開催イベント
          </h2>
          <Link href="/events" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            すべて見る <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.slice(0, 6).map((event) => {
            const et = tasks.filter((t) => t.eventId === event.id)
            const daysLeft = countDaysUntilEvent(event.date)
            const overdueCnt = et.filter((t) => isOverdue(t) && t.status !== 'done').length
            const unassignedCnt = et.filter((t) => isUnassigned(t) && t.status !== 'done').length
            const doneCnt = et.filter((t) => t.status === 'done').length
            const pct = et.length ? Math.round((doneCnt / et.length) * 100) : 0
            const hasDanger = overdueCnt > 0 || unassignedCnt > 0

            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className={`block bg-white rounded-xl border-2 p-4 hover:shadow-md transition-all ${
                  hasDanger ? 'border-red-200 bg-red-50/30' : 'border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{event.name}</h3>
                  {hasDanger && (
                    <span className="flex-shrink-0 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                      要注意
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                  <CalendarDays size={11} />
                  {daysLeft < 0 ? '終了済み' : daysLeft === 0 ? '本日開催' : `あと${daysLeft}日`}
                </div>

                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    未完了 {et.filter((t) => t.status !== 'done').length}
                  </span>
                  {overdueCnt > 0 && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                      期限切れ {overdueCnt}
                    </span>
                  )}
                  {unassignedCnt > 0 && (
                    <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-medium">
                      未担当 {unassignedCnt}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: pct < 30 ? '#f97316' : '#22c55e',
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{pct}%</span>
                </div>
              </Link>
            )
          })}

          <Link
            href="/events/new"
            className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all min-h-[140px]"
          >
            <Plus size={24} />
            <span className="text-sm font-medium">新しいイベントを作成</span>
          </Link>
        </div>
      </section>

      {editing && (
        <TaskEditModal
          task={editing}
          members={getMembersForTask(editing)}
          onSave={updateTask}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
