'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { Event } from '@/lib/types'
import { TASK_TEMPLATES } from '@/lib/taskTemplates'
import { formatDate } from '@/lib/taskUtils'
import {
  getPromotionalSchedule,
  getAutoRecruitmentDates,
  fmtMD,
  PHASE_COLORS,
  PHASE_BAR_COLORS,
} from '@/lib/scheduleUtils'
import GoogleConnectButton from '@/components/google/GoogleConnectButton'
import {
  Check, ChevronRight, ChevronLeft, Loader2,
  Calendar, MapPin, Users, FileText, AlertCircle,
} from 'lucide-react'

type Step1Data = { name: string; date: string; time: string; venue: string; description: string }
type Step2Data = { members: [string, string, string] }

const STEP_LABELS = ['イベント情報', '運営メンバー', 'タスク確認']

// Phase labels for task group headers
const PHASE_HEADER: Record<number, { label: string; icon: string; accent: string }> = {
  30: { label: '企画スタート（30日前）',   icon: '🗂️',  accent: 'border-slate-300 bg-slate-50' },
  28: { label: '集客計画スタート（28日前）', icon: '📢', accent: 'border-violet-300 bg-violet-50' },
  21: { label: '告知素材づくり（21日前）',  icon: '✍️',  accent: 'border-orange-300 bg-orange-50' },
  14: { label: 'フライヤー完成・一斉告知（14日前）', icon: '🎨', accent: 'border-blue-300 bg-blue-50' },
   7: { label: 'リマインド・最終調整（7日前）',       icon: '📣', accent: 'border-yellow-300 bg-yellow-50' },
   3: { label: '最終連絡（3日前）',         icon: '📱',  accent: 'border-green-300 bg-green-50' },
   1: { label: '前日確認',                  icon: '✅',  accent: 'border-emerald-300 bg-emerald-50' },
}

export default function EventForm() {
  const router = useRouter()
  const { createEvent, googleSession, syncEventToGoogle } = useApp()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [step1, setStep1] = useState<Step1Data>({ name: '', date: '', time: '', venue: '', description: '' })
  const [step2, setStep2] = useState<Step2Data>({ members: ['', '', ''] })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Computed from event date — no manual input needed
  const autoSchedule = step1.date ? getPromotionalSchedule(step1.date) : []
  const autoRecruitment = step1.date ? getAutoRecruitmentDates(step1.date) : null
  const daysUntilEvent = step1.date
    ? Math.ceil((new Date(step1.date).getTime() - Date.now()) / 86400000)
    : null

  function validateStep1() {
    const e: Record<string, string> = {}
    if (!step1.name.trim()) e.name = 'イベント名を入力してください'
    if (!step1.date) e.date = '開催日を入力してください'
    if (!step1.time) e.time = '開催時間を入力してください'
    if (!step1.venue.trim()) e.venue = '会場を入力してください'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2() {
    const e: Record<string, string> = {}
    if (!step2.members[0].trim()) e.m0 = 'メンバー1を入力してください'
    if (!step2.members[1].trim()) e.m1 = 'メンバー2を入力してください'
    if (!step2.members[2].trim()) e.m2 = 'メンバー3を入力してください'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function goNext() {
    setErrors({})
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) setStep(3)
  }
  function goBack() { setErrors({}); setStep((s) => s - 1) }

  async function handleSubmit() {
    setLoading(true)
    try {
      const data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
        name:        step1.name.trim(),
        date:        step1.date,
        time:        step1.time,
        venue:       step1.venue.trim(),
        description: step1.description || undefined,
        // Auto-calculated — no manual input required
        recruitmentStartDate: autoRecruitment?.recruitmentStartDate,
        recruitmentDeadline:  autoRecruitment?.recruitmentDeadline,
        members: [step2.members[0].trim(), step2.members[1].trim(), step2.members[2].trim()],
      }
      const event = createEvent(data)

      // Auto-sync to Google if connected (best-effort — failure won't block navigation)
      if (googleSession) {
        try {
          await syncEventToGoogle(event.id)
        } catch (e) {
          console.error('Google 同期に失敗しました:', e)
        }
      }

      router.push(`/events/${event.id}`)
    } finally {
      setLoading(false)
    }
  }

  function setMember(i: number, v: string) {
    const m = [...step2.members] as [string, string, string]
    m[i] = v
    setStep2({ members: m })
  }

  // Group tasks by phase for step 3
  const phases = [30, 28, 21, 14, 7, 3, 1]
  const tasksByPhase = phases.map((days) => ({
    days,
    meta: PHASE_HEADER[days],
    tasks: TASK_TEMPLATES.filter((t) => t.daysBeforeEvent === days),
  }))

  const memberRoleLabels = [
    'メンバー1（企画担当）',
    'メンバー2（集客・告知担当）',
    'メンバー3（会場・備品担当）',
  ]

  return (
    <div>
      {/* Step indicator */}
      <div className="flex mb-8">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1
          const isDone = step > n
          const isActive = step === n
          return (
            <div key={n} className="flex-1 flex items-center">
              <div className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-center text-xs border-2 transition-colors ${
                isDone ? 'border-green-500 bg-green-50 text-green-700'
                : isActive ? 'border-slate-800 bg-slate-800 text-white'
                : 'border-slate-200 text-slate-400'
              }`}>
                <span className="font-bold text-sm">{isDone ? <Check size={13} /> : `Step${n}`}</span>
                <span>{label}</span>
              </div>
              {i < 2 && <div className={`w-3 h-0.5 flex-shrink-0 ${step > n ? 'bg-green-400' : 'bg-slate-200'}`} />}
            </div>
          )
        })}
      </div>

      {/* ─── Step 1: Event info + live schedule preview ─── */}
      {step === 1 && (
        <div className="space-y-5">
          <p className="text-xs text-slate-400 border-l-3 border-indigo-400 pl-3 border-l-4">
            イベント日を入れると集客スケジュールが自動で計算されます
          </p>

          <Field label="イベント名" required error={errors.name}>
            <input type="text" value={step1.name}
              onChange={(e) => setStep1({ ...step1, name: e.target.value })}
              placeholder="例）第10回国際交流パーティー"
              className={inputCls(!!errors.name)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="開催日" required error={errors.date}>
              <input type="date" value={step1.date}
                onChange={(e) => setStep1({ ...step1, date: e.target.value })}
                className={inputCls(!!errors.date)} />
            </Field>
            <Field label="開催時間" required error={errors.time}>
              <input type="time" value={step1.time}
                onChange={(e) => setStep1({ ...step1, time: e.target.value })}
                className={inputCls(!!errors.time)} />
            </Field>
          </div>

          <Field label="会場" required error={errors.venue}>
            <input type="text" value={step1.venue}
              onChange={(e) => setStep1({ ...step1, venue: e.target.value })}
              placeholder="例）渋谷区文化総合センター大和田"
              className={inputCls(!!errors.venue)} />
          </Field>

          <Field label="イベント概要（任意）">
            <textarea value={step1.description} rows={2}
              onChange={(e) => setStep1({ ...step1, description: e.target.value })}
              placeholder="どんなイベントか簡単に"
              className={`${inputCls(false)} resize-none`} />
          </Field>

          {/* ── Live promotional schedule preview ── */}
          {step1.date && (
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50 to-white p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-indigo-800">
                  📅 自動生成される集客スケジュール
                </h3>
                <span className="text-xs text-indigo-500 font-medium">
                  {daysUntilEvent != null && daysUntilEvent > 0
                    ? `開催まで ${daysUntilEvent} 日`
                    : daysUntilEvent === 0 ? '本日開催'
                    : '開催済み'}
                </span>
              </div>

              {/* Warning if event is too soon */}
              {daysUntilEvent != null && daysUntilEvent < 14 && daysUntilEvent >= 0 && (
                <div className="flex items-start gap-2 mb-3 p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-700">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>開催まで2週間を切っています。いくつかのタスクは既に期限切れになります。</span>
                </div>
              )}

              {/* Timeline bar */}
              <div className="relative mb-5">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full bg-gradient-to-r from-violet-400 via-blue-400 to-green-400 rounded-full" style={{ width: '100%' }} />
                </div>
                {/* Milestone dots on the bar */}
                <div className="relative mt-1 h-6">
                  {autoSchedule.map((ms) => {
                    const pct = ((28 - ms.daysBeforeEvent) / 27) * 100
                    return (
                      <div
                        key={ms.key}
                        className="absolute top-0 flex flex-col items-center"
                        style={{ left: `${Math.min(pct, 96)}%`, transform: 'translateX(-50%)' }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm -mt-0.5"
                          style={{ background: PHASE_BAR_COLORS[ms.phase] }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Milestone list */}
              <div className="space-y-2">
                {autoSchedule.map((ms) => (
                  <div
                    key={ms.key}
                    className={`flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5 transition-opacity ${
                      ms.isPast ? 'opacity-40' : ''
                    } ${PHASE_COLORS[ms.phase]}`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="text-base leading-none mt-0.5">{ms.icon}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold leading-snug">{ms.label}</div>
                        <div className="text-xs opacity-70 mt-0.5 truncate">{ms.sublabel}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold">{fmtMD(ms.date)}</div>
                      <div className="text-[11px] opacity-60">
                        {ms.isPast ? '期限切れ' : ms.isToday ? '今日' : `${ms.daysBeforeEvent}日前`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-xs text-indigo-400 text-center">
                ※ 募集開始・締切日はイベント日から自動計算されます。入力不要です。
              </p>
            </div>
          )}

          <button onClick={goNext}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors">
            次へ: 運営メンバー <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ─── Step 2: Members (no manual date input — auto-calculated) ─── */}
      {step === 2 && (
        <div className="space-y-5">
          {/* Step 1 summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase mb-2 tracking-wide">Step1 入力済み</div>
            <div className="flex items-center gap-2 font-medium text-slate-800"><FileText size={13} className="text-slate-400" /> {step1.name}</div>
            <div className="flex items-center gap-2 text-slate-600"><Calendar size={13} className="text-slate-400" /> {formatDate(step1.date)} {step1.time}</div>
            <div className="flex items-center gap-2 text-slate-600"><MapPin size={13} className="text-slate-400" /> {step1.venue}</div>
          </div>

          {/* Auto-calculated recruitment dates — read-only info */}
          {autoRecruitment && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                🗓️ 集客日程（自動計算・入力不要）
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg px-3 py-2.5 border border-blue-100">
                  <div className="text-xs text-slate-500 mb-0.5">募集開始（SNS告知解禁）</div>
                  <div className="text-sm font-bold text-blue-700">{fmtMD(autoRecruitment.recruitmentStartDate)}</div>
                  <div className="text-xs text-blue-400">開催14日前</div>
                </div>
                <div className="bg-white rounded-lg px-3 py-2.5 border border-blue-100">
                  <div className="text-xs text-slate-500 mb-0.5">募集締切（推奨）</div>
                  <div className="text-sm font-bold text-blue-700">{fmtMD(autoRecruitment.recruitmentDeadline)}</div>
                  <div className="text-xs text-blue-400">開催5日前</div>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400 border-l-4 border-indigo-400 pl-3">
            担当タスクの自動割り当て：メンバー2が集客・フライヤー・告知を主担当します
          </p>

          {[0, 1, 2].map((idx) => (
            <Field key={idx} label={memberRoleLabels[idx]} required error={errors[`m${idx}`]}>
              <input type="text" value={step2.members[idx]}
                onChange={(e) => setMember(idx, e.target.value)}
                placeholder={`例）${['田中（企画）', '佐藤（集客）', '鈴木（会場）'][idx]}`}
                className={inputCls(!!errors[`m${idx}`])} />
            </Field>
          ))}

          <div className="flex gap-3 pt-2">
            <button onClick={goBack} className="flex items-center gap-1.5 px-4 py-3 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl text-sm transition-colors">
              <ChevronLeft size={15} /> 戻る
            </button>
            <button onClick={goNext} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors">
              次へ: タスク確認 <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 3: Visual task timeline ─── */}
      {step === 3 && (
        <div className="space-y-5">
          {/* Confirmation summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm space-y-1.5">
            <div className="text-xs font-semibold text-slate-400 uppercase mb-2 tracking-wide">作成内容の確認</div>
            <div className="font-bold text-slate-800 text-base">{step1.name}</div>
            <div className="flex items-center gap-2 text-slate-600"><Calendar size={13} className="text-slate-400" /> {formatDate(step1.date)} {step1.time} · {step1.venue}</div>
            <div className="flex items-center gap-2 text-slate-600"><Users size={13} className="text-slate-400" /> {step2.members.filter(Boolean).join(' / ')}</div>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 flex items-start gap-2">
            <span className="text-lg leading-none">⚡</span>
            <div>
              <p className="text-sm font-bold text-indigo-800">
                {TASK_TEMPLATES.length} タスクが自動生成されます
              </p>
              <p className="text-xs text-indigo-500 mt-0.5">
                集客計画からフライヤー完成、SNS告知、最終確認まで網羅
              </p>
            </div>
          </div>

          {/* Google sync status */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold text-slate-500 mb-2">Google連携</p>
            {googleSession ? (
              <div className="flex items-center gap-2 text-xs text-green-700">
                <span className="font-bold text-sm leading-none">G</span>
                <span>{googleSession.email} で連携中</span>
                <span className="ml-auto text-green-600 font-medium">✓ 作成時に自動同期します</span>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-400">連携するとGoogleカレンダー・Google Todoに自動追加されます</p>
                <GoogleConnectButton />
              </div>
            )}
          </div>

          {/* Phase-grouped task list */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-0.5">
            {tasksByPhase.map(({ days, meta, tasks }) => {
              if (!tasks.length) return null
              return (
                <div key={days}>
                  <div className={`flex items-center gap-2 text-xs font-bold rounded-lg px-3 py-2 border mb-2 ${meta.accent}`}>
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                    <span className="ml-auto text-slate-400 font-normal">{tasks.length}件</span>
                  </div>
                  <div className="space-y-1.5 pl-2">
                    {tasks.map((t) => {
                      const assignee =
                        t.assigneeRole === 'member1' ? step2.members[0]
                        : t.assigneeRole === 'member2' ? step2.members[1]
                        : t.assigneeRole === 'member3' ? step2.members[2]
                        : null
                      return (
                        <div key={t.templateKey}
                          className="flex items-center justify-between gap-2 bg-white border border-slate-100 rounded-lg px-3 py-2 text-sm">
                          <span className="text-slate-700 leading-snug">{t.title}</span>
                          {assignee ? (
                            <span className="flex items-center gap-1.5 text-xs text-slate-500 flex-shrink-0">
                              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                                {assignee[0]}
                              </span>
                              <span className="hidden sm:block">{assignee}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-violet-400 flex-shrink-0">未担当</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={goBack} className="flex items-center gap-1.5 px-4 py-3 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl text-sm transition-colors">
              <ChevronLeft size={15} /> 戻る
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> 作成中...</>
                : <>🚀 イベントを作成する（{TASK_TEMPLATES.length}タスクを生成）</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── helpers ──────────────────────────────────────────────────────────────────

const memberRoleLabels = ['メンバー1（企画担当）', 'メンバー2（集客・告知担当）', 'メンバー3（会場・備品担当）']

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function inputCls(err: boolean): string {
  return `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
    err ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
  }`
}
