'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { Event } from '@/lib/types'
import { CalendarDays, Clock, MapPin, Users, FileText, Loader2 } from 'lucide-react'

type FormData = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>

export default function EventForm() {
  const router = useRouter()
  const { createEvent } = useApp()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormData>({
    name: '',
    date: '',
    time: '',
    venue: '',
    description: '',
    recruitmentStartDate: '',
    recruitmentDeadline: '',
    members: ['', '', ''],
  })

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})

  function validate(): boolean {
    const e: Partial<Record<string, string>> = {}
    if (!form.name.trim()) e.name = 'イベント名を入力してください'
    if (!form.date) e.date = '開催日を入力してください'
    if (!form.time) e.time = '開催時間を入力してください'
    if (!form.venue.trim()) e.venue = '会場を入力してください'
    if (!form.members[0].trim()) e.member0 = 'メンバー1を入力してください'
    if (!form.members[1].trim()) e.member1 = 'メンバー2を入力してください'
    if (!form.members[2].trim()) e.member2 = 'メンバー3を入力してください'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const event = createEvent({
        ...form,
        members: [
          form.members[0].trim(),
          form.members[1].trim(),
          form.members[2].trim(),
        ],
        description: form.description || undefined,
        recruitmentStartDate: form.recruitmentStartDate || undefined,
        recruitmentDeadline: form.recruitmentDeadline || undefined,
      })
      router.push(`/events/${event.id}`)
    } finally {
      setLoading(false)
    }
  }

  function setMember(idx: number, val: string) {
    const members = [...form.members] as [string, string, string]
    members[idx] = val
    setForm({ ...form, members })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic info */}
      <section>
        <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FileText size={18} className="text-indigo-500" />
          基本情報
        </h2>
        <div className="space-y-4">
          <Field label="イベント名" required error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="例）第10回国際交流パーティー"
              className={inputClass(!!errors.name)}
            />
          </Field>

          <Field label="イベント概要" error={errors.description}>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="イベントの概要を入力（任意）"
              className={`${inputClass(false)} resize-none`}
            />
          </Field>
        </div>
      </section>

      {/* Date and venue */}
      <section>
        <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <CalendarDays size={18} className="text-indigo-500" />
          開催情報
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="開催日" required error={errors.date}>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={inputClass(!!errors.date)}
            />
          </Field>

          <Field label="開催時間" required error={errors.time}>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className={inputClass(!!errors.time)}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="会場" required error={errors.venue}>
              <input
                type="text"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="例）渋谷区文化総合センター大和田"
                className={inputClass(!!errors.venue)}
              />
            </Field>
          </div>

          <Field label="参加者募集開始日" error={errors.recruitmentStartDate}>
            <input
              type="date"
              value={form.recruitmentStartDate}
              onChange={(e) => setForm({ ...form, recruitmentStartDate: e.target.value })}
              className={inputClass(false)}
            />
          </Field>

          <Field label="募集締切日" error={errors.recruitmentDeadline}>
            <input
              type="date"
              value={form.recruitmentDeadline}
              onChange={(e) => setForm({ ...form, recruitmentDeadline: e.target.value })}
              className={inputClass(false)}
            />
          </Field>
        </div>
      </section>

      {/* Members */}
      <section>
        <h2 className="text-base font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <Users size={18} className="text-indigo-500" />
          運営メンバー
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          担当タスクは自動割り当てされます：メンバー1=企画、メンバー2=告知・連絡、メンバー3=会場・備品
        </p>
        <div className="space-y-3">
          {[0, 1, 2].map((idx) => (
            <Field
              key={idx}
              label={`メンバー${idx + 1}${idx === 0 ? '（企画担当）' : idx === 1 ? '（告知・連絡担当）' : '（会場・備品担当）'}`}
              required
              error={errors[`member${idx}`]}
            >
              <input
                type="text"
                value={form.members[idx]}
                onChange={(e) => setMember(idx, e.target.value)}
                placeholder={`例）${['田中', '佐藤', '鈴木'][idx]}`}
                className={inputClass(!!errors[`member${idx}`])}
              />
            </Field>
          ))}
        </div>
      </section>

      {/* Submit */}
      <div className="pt-4 border-t border-slate-200">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-indigo-700">
            <strong>タスク自動生成について：</strong>
            イベントを作成すると、開催日から逆算した22個の準備タスクが自動生成されます。
            担当者は後から変更できます。
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              作成中...
            </>
          ) : (
            'イベントを作成してタスクを生成する'
          )}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean): string {
  return `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
    hasError ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
  }`
}
