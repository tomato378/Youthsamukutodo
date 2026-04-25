import { subDays, parseISO, format, differenceInCalendarDays } from 'date-fns'

export interface PromotionalMilestone {
  key: string
  label: string
  sublabel: string
  icon: string
  date: string        // YYYY-MM-DD
  daysBeforeEvent: number
  phase: 'plan' | 'create' | 'launch' | 'remind' | 'close'
}

const PHASE_COLORS: Record<PromotionalMilestone['phase'], string> = {
  plan:   'bg-violet-100 text-violet-700 border-violet-200',
  create: 'bg-orange-100 text-orange-700 border-orange-200',
  launch: 'bg-blue-100   text-blue-700   border-blue-200',
  remind: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  close:  'bg-green-100  text-green-700  border-green-200',
}

const PHASE_BAR_COLORS: Record<PromotionalMilestone['phase'], string> = {
  plan:   '#8b5cf6',
  create: '#f97316',
  launch: '#3b82f6',
  remind: '#eab308',
  close:  '#22c55e',
}

export { PHASE_COLORS, PHASE_BAR_COLORS }

const MILESTONE_DEFS: Omit<PromotionalMilestone, 'date'>[] = [
  {
    key: 'promo_plan',
    label: '集客計画・フライヤー企画',
    sublabel: 'ターゲットと告知チャネルを確定',
    icon: '📢',
    daysBeforeEvent: 28,
    phase: 'plan',
  },
  {
    key: 'flyer_copy',
    label: '告知文・フライヤー文面を完成',
    sublabel: '日本語・英語テキスト確定',
    icon: '✍️',
    daysBeforeEvent: 21,
    phase: 'create',
  },
  {
    key: 'form_open',
    label: '申込フォーム公開',
    sublabel: 'SNS投稿スケジュールも確定',
    icon: '📋',
    daysBeforeEvent: 21,
    phase: 'create',
  },
  {
    key: 'flyer_done',
    label: 'フライヤー完成・SNS一斉告知開始',
    sublabel: 'SNS・LINE・口コミで告知解禁',
    icon: '🎨',
    daysBeforeEvent: 14,
    phase: 'launch',
  },
  {
    key: 'mid_push',
    label: '申込状況チェック・追加集客',
    sublabel: '参加者にリマインド送信',
    icon: '📊',
    daysBeforeEvent: 7,
    phase: 'remind',
  },
  {
    key: 'recruitment_close',
    label: '募集締切（推奨）',
    sublabel: '最終人数確定・備品手配へ',
    icon: '🚪',
    daysBeforeEvent: 5,
    phase: 'close',
  },
  {
    key: 'final_notice',
    label: '参加者への最終案内',
    sublabel: '会場・集合時間・持ち物を連絡',
    icon: '📱',
    daysBeforeEvent: 3,
    phase: 'close',
  },
]

/**
 * Calculate all promotional milestones from the event date.
 * Returns milestones with their concrete due dates.
 * If a milestone has already passed (relative to today) it is flagged.
 */
export function getPromotionalSchedule(eventDate: string): (PromotionalMilestone & { isPast: boolean; isToday: boolean })[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return MILESTONE_DEFS.map((def) => {
    const date = format(subDays(parseISO(eventDate), def.daysBeforeEvent), 'yyyy-MM-dd')
    const d = parseISO(date)
    d.setHours(0, 0, 0, 0)
    const diff = differenceInCalendarDays(d, today)
    return {
      ...def,
      date,
      isPast:   diff < 0,
      isToday:  diff === 0,
    }
  })
}

/**
 * Auto-calculate recruitment start and deadline from event date.
 * Used to pre-fill the form and remove the need for manual input.
 */
export function getAutoRecruitmentDates(eventDate: string): {
  recruitmentStartDate: string   // 14 days before = SNS launch
  recruitmentDeadline: string    // 5 days before  = recommended close
} {
  return {
    recruitmentStartDate: format(subDays(parseISO(eventDate), 14), 'yyyy-MM-dd'),
    recruitmentDeadline:  format(subDays(parseISO(eventDate), 5),  'yyyy-MM-dd'),
  }
}

/** Format YYYY-MM-DD → M月D日 */
export function fmtMD(dateStr: string): string {
  try { return format(parseISO(dateStr), 'M月d日') }
  catch { return dateStr }
}
