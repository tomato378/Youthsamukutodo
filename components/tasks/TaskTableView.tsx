'use client'

import { useState } from 'react'
import { Task } from '@/lib/types'
import { formatDateShort, getRiskLevel } from '@/lib/taskUtils'
import TaskStatusBadge from './TaskStatusBadge'
import TaskRiskBadge from './TaskRiskBadge'
import TaskEditModal from './TaskEditModal'
import { User, Calendar, Pencil } from 'lucide-react'

interface Props {
  tasks: Task[]
  members: string[]
  onUpdateTask: (id: string, patch: Partial<Task>) => void
}

export default function TaskTableView({ tasks, members, onUpdateTask }: Props) {
  const [editing, setEditing] = useState<Task | null>(null)

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p>タスクがありません</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="text-left py-3 px-4 font-medium">タスク名</th>
              <th className="text-left py-3 px-4 font-medium">担当者</th>
              <th className="text-left py-3 px-4 font-medium">期限</th>
              <th className="text-left py-3 px-4 font-medium">進捗</th>
              <th className="text-left py-3 px-4 font-medium">危険度</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const risk = getRiskLevel(task)
              const rowClass =
                risk === 'overdue' && task.status !== 'done'
                  ? 'bg-red-50/50'
                  : risk === 'today' && task.status !== 'done'
                  ? 'bg-orange-50/50'
                  : ''
              return (
                <tr
                  key={task.id}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${rowClass}`}
                >
                  <td className="py-3 px-4">
                    <span className={task.status === 'done' ? 'line-through text-slate-400' : ''}>
                      {task.title}
                    </span>
                    {task.memo && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{task.memo}</p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {task.assignee ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-medium">
                          {task.assignee[0]}
                        </span>
                        {task.assignee}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs flex items-center gap-1">
                        <User size={12} /> 未担当
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Calendar size={12} />
                      {formatDateShort(task.dueDate)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <TaskStatusBadge status={task.status} />
                  </td>
                  <td className="py-3 px-4">
                    <TaskRiskBadge task={task} />
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setEditing(task)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3 p-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
            onClick={() => setEditing(task)}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span
                className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-900'}`}
              >
                {task.title}
              </span>
              <TaskRiskBadge task={task} />
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <User size={11} />
                {task.assignee ?? '未担当'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {formatDateShort(task.dueDate)}
              </span>
              <TaskStatusBadge status={task.status} />
            </div>
            {task.memo && <p className="mt-2 text-xs text-slate-400 line-clamp-2">{task.memo}</p>}
          </div>
        ))}
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
