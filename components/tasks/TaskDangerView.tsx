'use client'

import { useState } from 'react'
import { Task } from '@/lib/types'
import { formatDateShort, isOverdue, isDueToday, isDueSoon, isUnassigned, isWaitingReview } from '@/lib/taskUtils'
import TaskStatusBadge from './TaskStatusBadge'
import TaskEditModal from './TaskEditModal'
import { AlertTriangle, User, Calendar } from 'lucide-react'

interface Props {
  tasks: Task[]
  members: string[]
  onUpdateTask: (id: string, patch: Partial<Task>) => void
}

interface DangerSection {
  key: string
  label: string
  icon: string
  color: string
  bgColor: string
  borderColor: string
  filter: (t: Task) => boolean
}

const SECTIONS: DangerSection[] = [
  {
    key: 'overdue',
    label: '期限切れ',
    icon: '🔴',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    filter: (t) => isOverdue(t) && t.status !== 'done',
  },
  {
    key: 'today',
    label: '今日まで',
    icon: '🟠',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    filter: (t) => isDueToday(t) && t.status !== 'done',
  },
  {
    key: 'soon',
    label: '3日以内',
    icon: '🟡',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    filter: (t) => isDueSoon(t) && t.status !== 'done',
  },
  {
    key: 'unassigned',
    label: '未担当',
    icon: '🟣',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    filter: (t) => isUnassigned(t) && t.status !== 'done',
  },
  {
    key: 'review',
    label: '確認待ち',
    icon: '🔵',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    filter: (t) => isWaitingReview(t),
  },
]

export default function TaskDangerView({ tasks, members, onUpdateTask }: Props) {
  const [editing, setEditing] = useState<Task | null>(null)
  const hasAnyDanger = SECTIONS.some((s) => tasks.filter(s.filter).length > 0)

  if (!hasAnyDanger) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-3">🎉</div>
        <p className="text-slate-600 font-medium">危険なタスクはありません！</p>
        <p className="text-slate-400 text-sm mt-1">全タスクが順調に進んでいます</p>
      </div>
    )
  }

  return (
    <>
      <div className="p-4 space-y-6">
        {SECTIONS.map((section) => {
          const sectionTasks = tasks.filter(section.filter)
          if (sectionTasks.length === 0) return null
          return (
            <div key={section.key}>
              <h3 className={`flex items-center gap-2 text-sm font-semibold mb-3 ${section.color}`}>
                <span>{section.icon}</span>
                {section.label}
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${section.bgColor} border ${section.borderColor}`}>
                  {sectionTasks.length}件
                </span>
              </h3>
              <div className="space-y-2">
                {sectionTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => setEditing(task)}
                    className={`w-full text-left flex items-start justify-between gap-3 p-3 rounded-xl border ${section.bgColor} ${section.borderColor} hover:shadow-sm transition-shadow`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 mb-1">{task.title}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User size={11} />
                          {task.assignee ?? <span className="text-violet-500">未担当</span>}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDateShort(task.dueDate)}
                        </span>
                        <TaskStatusBadge status={task.status} />
                      </div>
                    </div>
                    <AlertTriangle size={14} className={section.color} />
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {editing && (
        <TaskEditModal
          task={editing}
          members={members}
          onSave={onUpdateTask}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
