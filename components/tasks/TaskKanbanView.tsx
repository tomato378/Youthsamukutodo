'use client'

import { useState } from 'react'
import { Task, TaskStatus, TASK_STATUS_LABELS } from '@/lib/types'
import { formatDateShort, getRiskLevel, getRiskBadgeClass, getRiskLabel } from '@/lib/taskUtils'
import TaskEditModal from './TaskEditModal'
import { User, Calendar } from 'lucide-react'

interface Props {
  tasks: Task[]
  members: string[]
  onUpdateTask: (id: string, patch: Partial<Task>) => void
}

const COLUMNS: TaskStatus[] = ['not_started', 'in_progress', 'waiting_review', 'done']

const COLUMN_STYLES: Record<TaskStatus, string> = {
  not_started: 'border-t-slate-400',
  in_progress: 'border-t-blue-500',
  waiting_review: 'border-t-purple-500',
  done: 'border-t-green-500',
}

export default function TaskKanbanView({ tasks, members, onUpdateTask }: Props) {
  const [editing, setEditing] = useState<Task | null>(null)

  return (
    <>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 min-w-[600px]">
          {COLUMNS.map((status) => {
            const columnTasks = tasks.filter((t) => t.status === status)
            return (
              <div key={status} className="flex flex-col gap-3">
                {/* Column header */}
                <div
                  className={`bg-white rounded-xl border-t-4 border border-slate-200 p-3 ${COLUMN_STYLES[status]}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-slate-700">
                      {TASK_STATUS_LABELS[status]}
                    </h3>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                {columnTasks.map((task) => {
                  const risk = getRiskLevel(task)
                  return (
                    <button
                      key={task.id}
                      onClick={() => setEditing(task)}
                      className="text-left bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
                    >
                      <p className="text-sm font-medium text-slate-800 mb-2 leading-snug">
                        {task.title}
                      </p>

                      {risk !== 'normal' && status !== 'done' && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${getRiskBadgeClass(risk)}`}
                        >
                          {getRiskLabel(risk)}
                        </span>
                      )}

                      <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                        {task.assignee ? (
                          <span className="flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-medium">
                              {task.assignee[0]}
                            </span>
                            {task.assignee}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-violet-500">
                            <User size={11} /> 未担当
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDateShort(task.dueDate)}
                        </span>
                      </div>

                      {task.memo && (
                        <p className="mt-2 text-xs text-slate-400 line-clamp-2">{task.memo}</p>
                      )}
                    </button>
                  )
                })}

                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-slate-300 text-xs">なし</div>
                )}
              </div>
            )
          })}
        </div>
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
