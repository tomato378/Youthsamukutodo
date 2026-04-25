'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { Task } from '@/lib/types'
import {
  formatDate, countDaysUntilEvent,
  isOverdue, isDueToday, isDueSoon, isUnassigned, isWaitingReview,
} from '@/lib/taskUtils'
import TaskTableView from '@/components/tasks/TaskTableView'
import TaskKanbanView from '@/components/tasks/TaskKanbanView'
import TaskDangerView from '@/components/tasks/TaskDangerView'
import { ArrowLeft, MapPin, Calendar, List, Columns, AlertTriangle, Trash2 } from 'lucide-react'

type ViewMode = 'table' | 'kanban' | 'danger'

interface Props { eventId: string }

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
        <Link href="/events" className="text-indigo-600 hover:underline text-sm">イベント一覧に戻る</Link>
      </div>
    )
  }

  const daysLeft = countDaysUntilEvent(event.date)
  const stats = {
    total: eventTasks.length,
    done: eventTasks.filter((t) => t.status === 'done').length,
    incomplete: eventTasks.filter((t) => t.status !== 'done').length,
    overdue: eventTasks.filter((t) => isOverdue(t) && t.status !== 'done').length,
    today: eventTasks.filter((t) => isDueToday(t) && t.status !== 'done').length,
    unassigned: eventTasks.filter((t) => isUnassigned(t) && t.status !== 'done').length,
    review: eventTasks.filter(isWaitingReview).length,
  }
  const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0
  const dangerCount = stats.overdue + stats.today + stats.unassigned + stats.review

  const VIEWS: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: 'table',  label: '一覧表ビュー', icon: <List size={14} /> },
    { key: 'kanban', label: 'カンバン',     icon: <Columns size={14} /> },
    { key: 'danger', label: '危険タスク',   icon: <AlertTriangle size={14} /> },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5">
        <ArrowLeft size={14} /> イベント一覧に戻る
      </Link>

      {/* ─── Event info header ─── */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 mb-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                🌐 {event.name}
              </h1>
              {daysLeft < 0 ? (
                <span className="text-sm text-slate-400">終了済み</span>
              ) : daysLeft === 0 ? (
                <span className="text-sm font-medium text-orange-600">本日開催！</span>
              ) : (
                <span className="text-sm text-slate-500">あと {daysLeft} 日</span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                {formatDate(event.date)} {event.time}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400" />
                {event.venue}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Member avatars */}
            <div className="flex gap-1">
              {event.members.map((m) => (
                <div
                  key={m}
                  title={m}
                  className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shadow-sm"
                >
                  {m[0]}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
              title="イベントを削除"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-xs bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-medium">
            全{stats.total}タスク
          </span>
          <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium">
            完了 {stats.done}
          </span>
          <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full font-medium">
            未完了 {stats.incomplete}
          </span>
          {stats.overdue > 0 && (
            <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-full font-medium">
              期限切れ {stats.overdue}
            </span>
          )}
          {stats.unassigned > 0 && (
            <span className="text-xs bg-violet-100 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full font-medium">
              未担当 {stats.unassigned}
            </span>
          )}
          {stats.review > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
              確認待ち {stats.review}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${pct}%`, background: pct < 30 ? '#f97316' : '#22c55e' }}
            />
          </div>
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            {pct}% ({stats.done}/{stats.total}完了)
          </span>
        </div>
      </div>

      {/* ─── Task views ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center border-b-2 border-slate-200 px-4 bg-white">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => setViewMode(v.key)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-3.5 text-sm font-medium border-b-2 -mb-0.5 transition-colors ${
                viewMode === v.key
                  ? 'border-slate-800 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              } ${v.key === 'danger' && dangerCount > 0 ? 'text-red-400 hover:text-red-500' : ''}`}
            >
              {v.icon}
              <span className="hidden sm:block">{v.label}</span>
              <span className="sm:hidden">{v.key === 'table' ? '一覧' : v.key === 'kanban' ? 'カンバン' : '危険'}</span>
              {v.key === 'danger' && dangerCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium leading-none">
                  {dangerCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {viewMode === 'table'  && <TaskTableView  tasks={eventTasks} members={[...event.members]} onUpdateTask={updateTask} />}
        {viewMode === 'kanban' && <TaskKanbanView tasks={eventTasks} members={[...event.members]} onUpdateTask={updateTask} />}
        {viewMode === 'danger' && <TaskDangerView tasks={eventTasks} members={[...event.members]} onUpdateTask={updateTask} />}
      </div>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full border-2 border-slate-800 shadow-[4px_4px_0_#1e293b]"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900 mb-2">イベントを削除しますか？</h3>
            <p className="text-sm text-slate-500 mb-6">
              「{event.name}」とすべての関連タスクが削除されます。この操作は元に戻せません。
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 border-2 border-slate-200 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium">
                キャンセル
              </button>
              <button onClick={() => { deleteEvent(event.id); router.push('/events') }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors">
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
