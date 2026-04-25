'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { Task } from '@/lib/types'
import {
  formatDate,
  countDaysUntilEvent,
  isOverdue,
  isDueToday,
  isDueSoon,
  isUnassigned,
  isWaitingReview,
} from '@/lib/taskUtils'
import TaskTableView from '@/components/tasks/TaskTableView'
import TaskKanbanView from '@/components/tasks/TaskKanbanView'
import TaskDangerView from '@/components/tasks/TaskDangerView'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  List,
  Columns,
  AlertTriangle,
  Trash2,
} from 'lucide-react'

type ViewMode = 'table' | 'kanban' | 'danger'

interface Props {
  eventId: string
}

export default function EventDetailClient({ eventId }: Props) {
  const router = useRouter()
  const { events, tasks, updateTask, deleteEvent } = useApp()
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const event = events.find((e) => e.id === eventId)
  const eventTasks = tasks.filter((t) => t.eventId === eventId)

  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">イベントが見つかりませんでした</p>
        <Link href="/events" className="text-indigo-600 hover:underline text-sm">
          イベント一覧に戻る
        </Link>
      </div>
    )
  }

  const daysLeft = countDaysUntilEvent(event.date)

  const stats = {
    total: eventTasks.length,
    done: eventTasks.filter((t) => t.status === 'done').length,
    overdue: eventTasks.filter((t) => isOverdue(t) && t.status !== 'done').length,
    today: eventTasks.filter((t) => isDueToday(t) && t.status !== 'done').length,
    soon: eventTasks.filter((t) => isDueSoon(t) && t.status !== 'done').length,
    unassigned: eventTasks.filter((t) => isUnassigned(t) && t.status !== 'done').length,
    review: eventTasks.filter(isWaitingReview).length,
  }

  const progressPct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0

  function handleDelete() {
    deleteEvent(event!.id)
    router.push('/events')
  }

  const views: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: 'table', label: '一覧表', icon: <List size={15} /> },
    { key: 'kanban', label: 'カンバン', icon: <Columns size={15} /> },
    { key: 'danger', label: '危険タスク', icon: <AlertTriangle size={15} /> },
  ]

  const dangerCount =
    stats.overdue + stats.today + stats.soon + stats.unassigned + stats.review

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back link */}
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5"
      >
        <ArrowLeft size={14} />
        イベント一覧に戻る
      </Link>

      {/* Event info card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{event.name}</h1>
            {daysLeft < 0 ? (
              <span className="text-sm text-slate-400">終了済み</span>
            ) : daysLeft === 0 ? (
              <span className="text-sm font-medium text-orange-600">本日開催！</span>
            ) : (
              <span className="text-sm text-slate-500">開催まであと {daysLeft} 日</span>
            )}
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="イベントを削除"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar size={15} className="text-slate-400 flex-shrink-0" />
            {formatDate(event.date)} {event.time}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={15} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users size={15} className="text-slate-400 flex-shrink-0" />
            {event.members.join(' / ')}
          </div>
        </div>

        {event.description && (
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">{event.description}</p>
        )}

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-100 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate-600">
            {stats.done}/{stats.total} 完了 ({progressPct}%)
          </span>
        </div>
      </div>

      {/* Danger stats */}
      {dangerCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {stats.overdue > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-xs text-red-500">期限切れ</div>
            </div>
          )}
          {stats.today > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-orange-600">{stats.today}</div>
              <div className="text-xs text-orange-500">今日まで</div>
            </div>
          )}
          {stats.soon > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-yellow-600">{stats.soon}</div>
              <div className="text-xs text-yellow-500">3日以内</div>
            </div>
          )}
          {stats.unassigned > 0 && (
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-violet-600">{stats.unassigned}</div>
              <div className="text-xs text-violet-500">未担当</div>
            </div>
          )}
          {stats.review > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-blue-600">{stats.review}</div>
              <div className="text-xs text-blue-500">確認待ち</div>
            </div>
          )}
        </div>
      )}

      {/* View switcher + task area */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center border-b border-slate-200 px-4">
          {views.map((view) => (
            <button
              key={view.key}
              onClick={() => setViewMode(view.key)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                viewMode === view.key
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              } ${view.key === 'danger' && dangerCount > 0 ? 'text-red-500 hover:text-red-600' : ''}`}
            >
              {view.icon}
              {view.label}
              {view.key === 'danger' && dangerCount > 0 && (
                <span className="ml-1 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full font-medium">
                  {dangerCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Task views */}
        {viewMode === 'table' && (
          <TaskTableView
            tasks={eventTasks}
            members={[...event.members]}
            onUpdateTask={updateTask}
          />
        )}
        {viewMode === 'kanban' && (
          <TaskKanbanView
            tasks={eventTasks}
            members={[...event.members]}
            onUpdateTask={updateTask}
          />
        )}
        {viewMode === 'danger' && (
          <TaskDangerView
            tasks={eventTasks}
            members={[...event.members]}
            onUpdateTask={updateTask}
          />
        )}
      </div>

      {/* Delete confirm dialog */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-slate-900 mb-2">イベントを削除しますか？</h3>
            <p className="text-sm text-slate-500 mb-6">
              「{event.name}」とすべての関連タスクが削除されます。この操作は元に戻せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
