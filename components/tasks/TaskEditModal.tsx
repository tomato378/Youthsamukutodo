'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Task, TaskStatus, TASK_STATUS_LABELS } from '@/lib/types'

interface Props {
  task: Task
  members: string[]
  onSave: (id: string, patch: Partial<Task>) => void
  onClose: () => void
}

const STATUSES: TaskStatus[] = ['not_started', 'in_progress', 'waiting_review', 'done']

const STATUS_ACTIVE_STYLES: Record<TaskStatus, string> = {
  not_started: 'border-slate-600 bg-slate-50 text-slate-800 font-bold',
  in_progress: 'border-yellow-500 bg-yellow-50 text-yellow-800 font-bold',
  waiting_review: 'border-blue-500 bg-blue-50 text-blue-800 font-bold',
  done: 'border-green-500 bg-green-50 text-green-800 font-bold',
}

export default function TaskEditModal({ task, members, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    title: task.title,
    assignee: task.assignee ?? '',
    dueDate: task.dueDate,
    status: task.status as TaskStatus,
    memo: task.memo,
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function handleSave() {
    onSave(task.id, {
      title: form.title,
      assignee: form.assignee === '' ? null : form.assignee,
      dueDate: form.dueDate,
      status: form.status,
      memo: form.memo,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Mobile bottom sheet handle */}
      <div className="sm:hidden absolute bottom-0 left-0 right-0 pointer-events-none flex justify-center pb-[calc(4px+env(safe-area-inset-bottom))]" />

      <div
        className="bg-white w-full max-w-lg max-h-[92vh] overflow-y-auto
          rounded-2xl sm:rounded-2xl rounded-t-2xl
          border-2 border-slate-800
          shadow-[4px_4px_0_#1e293b]
          sm:shadow-[4px_4px_0_#1e293b]"
      >
        {/* Drag indicator on mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">✏️ タスクを編集</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Title */}
          <div>
            <label className="wf-label block text-sm font-medium text-slate-600 mb-1.5">タスク名</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border-2 border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-slate-800"
            />
          </div>

          {/* Assignee — visual card picker */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">担当者</label>
            <div className="flex gap-2">
              {/* Unassigned option */}
              <button
                onClick={() => setForm({ ...form, assignee: '' })}
                className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-colors text-xs ${
                  form.assignee === ''
                    ? 'border-slate-800 bg-slate-800 text-white'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                    form.assignee === '' ? 'border-white bg-slate-600 text-white' : 'border-slate-300 bg-slate-100 text-slate-400'
                  }`}
                >
                  ?
                </div>
                未担当
              </button>

              {members.map((m, i) => (
                <button
                  key={m}
                  onClick={() => setForm({ ...form, assignee: m })}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-colors text-xs ${
                    form.assignee === m
                      ? 'border-slate-800 bg-slate-800 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                      form.assignee === m ? 'border-white bg-white text-slate-800' : 'border-slate-300 bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {m[0]}
                  </div>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Status — button grid */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">進捗</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setForm({ ...form, status: s })}
                  className={`py-2.5 px-3 rounded-xl border-2 text-sm transition-colors ${
                    form.status === s
                      ? STATUS_ACTIVE_STYLES[s]
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
                  }`}
                >
                  {TASK_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">期限</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full border-2 border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-slate-800"
            />
          </div>

          {/* Memo */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">メモ</label>
            <textarea
              value={form.memo}
              onChange={(e) => setForm({ ...form, memo: e.target.value })}
              rows={2}
              placeholder="備考やメモを入力..."
              className="w-full border-2 border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-slate-800 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-slate-200 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            💾 保存する
          </button>
        </div>
      </div>
    </div>
  )
}
