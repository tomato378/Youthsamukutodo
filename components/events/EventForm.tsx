'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { Event } from '@/lib/types'
import { TASK_TEMPLATES } from '@/lib/taskTemplates'
import { resolveDueDate, resolveAssignee, formatDate } from '@/lib/taskUtils'
import { Check, ChevronRight, ChevronLeft, Loader2, Calendar, MapPin, Users, FileText } from 'lucide-react'

type Step1Data = {
  name: string
  date: string
  time: string
  venue: string
  description: string
}

type Step2Data = {
  members: [string, string, string]
  recruitmentStartDate: string
  recruitmentDeadline: string
}

const STEPS = [
  { label: 'イベント情報', sublabel: '基本情報' },
  { label: '運営メンバー', sublabel: 'メンバー' },
  { label: 'タスク確認', sublabel: '確認' },
]

const PHASE_LABELS: Record<number, string> = {
  30: '開催30日前まで',
  21: '開催21日前まで',
  14: '開催14日前まで',
  7: '開催7日前まで',
  3: '開催3日前まで',
  1: '開催前日まで',
}

export default function EventForm() {
  const router = useRouter()
  const { createEvent } = useApp()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [step1, setStep1] = useState<Step1Data>({
    name: '', date: '', time: '', venue: '', description: '',
  })
  const [step2, setStep2] = useState<Step2Data>({
    members: ['', '', ''],
    recruitmentStartDate: '',
    recruitmentDeadline: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validateStep1(): boolean {
    const e: Record<string, string> = {}
    if (!step1.name.trim()) e.name = 'イベント名を入力してください'
    if (!step1.date) e.date = '開催日を入力してください'
    if (!step1.time) e.time = '開催時間を入力してください'
    if (!step1.venue.trim()) e.venue = '会場を入力してください'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2(): boolean {
    const e: Record<string, string> = {}
    if (!step2.members[0].trim()) e.member0 = 'メンバー1を入力してください'
    if (!step2.members[1].trim()) e.member1 = 'メンバー2を入力してください'
    if (!step2.members[2].trim()) e.member2 = 'メンバー3を入力してください'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function goNext() {
    setErrors({})
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) setStep(3)
  }

  function goBack() {
    setErrors({})
    setStep((s) => s - 1)
  }

  function handleSubmit() {
    setLoading(true)
    try {
      const data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
        name: step1.name.trim(),
        date: step1.date,
        time: step1.time,
        venue: step1.venue.trim(),
        description: step1.description || undefined,
        recruitmentStartDate: step2.recruitmentStartDate || undefined,
        recruitmentDeadline: step2.recruitmentDeadline || undefined,
        members: [step2.members[0].trim(), step2.members[1].trim(), step2.members[2].trim()],
      }
      const event = createEvent(data)
      router.push(`/events/${event.id}`)
    } finally {
      setLoading(false)
    }
  }

  function setMember(idx: number, val: string) {
    const m = [...step2.members] as [string, string, string]
    m[idx] = val
    setStep2({ ...step2, members: m })
  }

  // Group templates by phase for step 3 preview
  const phases = [30, 21, 14, 7, 3, 1]
  const templatesByPhase = phases.map((days) => ({
    days,
    label: PHASE_LABELS[days],
    tasks: TASK_TEMPLATES.filter((t) => t.daysBeforeEvent === days),
  }))

  const memberLabels = ['メンバー1（企画）', 'メンバー2（告知・連絡）', 'メンバー3（会場・備品）']

  return (
    <div>
      {/* Step indicator */}
      <div className="flex mb-8">
        {STEPS.map((s, i) => {
          const n = i + 1
          const isDone = step > n
          const isActive = step === n
          return (
            <div key={n} className="flex-1 flex items-center">
              <div className="flex-1">
                <div
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-center text-xs border-2 transition-colors ${
                    isDone
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : isActive
                      ? 'border-slate-800 bg-slate-800 text-white'
                      : 'border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="font-bold text-sm">
                    {isDone ? <Check size={14} /> : `Step${n}`}
                  </span>
                  <span>{s.sublabel}</span>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-4 h-0.5 flex-shrink-0 ${step > n ? 'bg-green-400' : 'bg-slate-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* ── Step 1: Event Info ── */}
      {step === 1 && (
        <div className="space-y-5">
          <p className="text-sm text-slate-500 border-l-4 border-indigo-400 pl-3">
            イベントの基本情報を入力してください
          </p>

          <Field label="イベント名" required error={errors.name}>
            <input
              type="text"
              value={step1.name}
              onChange={(e) => setStep1({ ...step1, name: e.target.value })}
              placeholder="例）第10回国際交流パーティー"
              className={inputClass(!!errors.name)}
            />
          </Field>

          <Field label="イベント概要">
            <textarea
              value={step1.description}
              onChange={(e) => setStep1({ ...step1, description: e.target.value })}
              rows={2}
              placeholder="概要（任意）"
              className={`${inputClass(false)} resize-none`}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="開催日" required error={errors.date}>
              <input
                type="date"
                value={step1.date}
                onChange={(e) => setStep1({ ...step1, date: e.target.value })}
                className={inputClass(!!errors.date)}
              />
            </Field>
            <Field label="開催時間" required error={errors.time}>
              <input
                type="time"
                value={step1.time}
                onChange={(e) => setStep1({ ...step1, time: e.target.value })}
                className={inputClass(!!errors.time)}
              />
            </Field>
          </div>

          <Field label="会場" required error={errors.venue}>
            <input
              type="text"
              value={step1.venue}
              onChange={(e) => setStep1({ ...step1, venue: e.target.value })}
              placeholder="例）渋谷区文化総合センター大和田"
              className={inputClass(!!errors.venue)}
            />
          </Field>

          <button
            onClick={goNext}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
          >
            次へ: 運営メンバー <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Step 2: Members ── */}
      {step === 2 && (
        <div className="space-y-5">
          {/* Step 1 summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Step1 入力済み</div>
            <div className="flex items-center gap-2"><FileText size={13} className="text-slate-400" /> {step1.name}</div>
            <div className="flex items-center gap-2"><Calendar size={13} className="text-slate-400" /> {step1.date} {step1.time}</div>
            <div className="flex items-center gap-2"><MapPin size={13} className="text-slate-400" /> {step1.venue}</div>
          </div>

          <p className="text-sm text-slate-500 border-l-4 border-indigo-400 pl-3">
            担当タスクの自動割り当て：メンバー1＝企画、メンバー2＝告知・連絡、メンバー3＝会場・備品
          </p>

          {[0, 1, 2].map((idx) => (
            <Field key={idx} label={memberLabels[idx]} required error={errors[`member${idx}`]}>
              <input
                type="text"
                value={step2.members[idx]}
                onChange={(e) => setMember(idx, e.target.value)}
                placeholder={`例）${['田中', '佐藤', '鈴木'][idx]}`}
                className={inputClass(!!errors[`member${idx}`])}
              />
            </Field>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <Field label="募集開始日">
              <input
                type="date"
                value={step2.recruitmentStartDate}
                onChange={(e) => setStep2({ ...step2, recruitmentStartDate: e.target.value })}
                className={inputClass(false)}
              />
            </Field>
            <Field label="募集締切日">
              <input
                type="date"
                value={step2.recruitmentDeadline}
                onChange={(e) => setStep2({ ...step2, recruitmentDeadline: e.target.value })}
                className={inputClass(false)}
              />
            </Field>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 px-4 py-3 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl text-sm transition-colors"
            >
              <ChevronLeft size={15} /> 戻る
            </button>
            <button
              onClick={goNext}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
            >
              次へ: タスク確認 <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Task Preview ── */}
      {step === 3 && (
        <div className="space-y-5">
          {/* Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase mb-2">作成内容の確認</div>
            <div className="flex items-center gap-2 font-medium text-slate-800">{step1.name}</div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar size={13} className="text-slate-400" /> {formatDate(step1.date)} {step1.time} · {step1.venue}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Users size={13} className="text-slate-400" />
              {step2.members.filter(Boolean).join(' / ')}
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <p className="text-sm text-indigo-700 font-medium mb-1">
              ⚡ 以下の {TASK_TEMPLATES.length} タスクが自動生成されます
            </p>
            <p className="text-xs text-indigo-500">開催日から逆算して期限を設定し、担当者を自動割り当てします</p>
          </div>

          {/* Task list grouped by phase */}
          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {templatesByPhase.map(({ days, label, tasks }) => (
              <div key={days}>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</div>
                <div className="space-y-1.5">
                  {tasks.map((t) => {
                    const assigneeName =
                      t.assigneeRole === 'member1' ? step2.members[0]
                      : t.assigneeRole === 'member2' ? step2.members[1]
                      : t.assigneeRole === 'member3' ? step2.members[2]
                      : null
                    return (
                      <div
                        key={t.templateKey}
                        className="flex items-center justify-between gap-3 bg-white border border-slate-100 rounded-lg px-3 py-2 text-sm"
                      >
                        <span className="text-slate-700">{t.title}</span>
                        {assigneeName ? (
                          <span className="flex items-center gap-1.5 text-xs text-slate-500 flex-shrink-0">
                            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                              {assigneeName[0]}
                            </span>
                            {assigneeName}
                          </span>
                        ) : (
                          <span className="text-xs text-violet-500 flex-shrink-0">未担当</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 px-4 py-3 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl text-sm transition-colors"
            >
              <ChevronLeft size={15} /> 戻る
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> 作成中...</>
              ) : (
                <>イベントを作成（{TASK_TEMPLATES.length}タスクを生成）</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
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
