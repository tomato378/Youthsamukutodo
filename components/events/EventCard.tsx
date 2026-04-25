import Link from 'next/link'
import { EventWithStats } from '@/lib/types'
import { formatDate, countDaysUntilEvent } from '@/lib/taskUtils'
import { MapPin, Calendar, Users, AlertTriangle, ChevronRight } from 'lucide-react'

interface Props {
  event: EventWithStats
}

export default function EventCard({ event }: Props) {
  const daysLeft = countDaysUntilEvent(event.date)
  const isOver = daysLeft < 0

  return (
    <Link
      href={`/events/${event.id}`}
      className="block bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all p-5 group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-indigo-700 transition-colors">
            {event.name}
          </h3>
          {isOver ? (
            <span className="text-xs text-slate-400">終了済み</span>
          ) : daysLeft === 0 ? (
            <span className="text-xs font-medium text-orange-600">本日開催！</span>
          ) : (
            <span className="text-xs text-slate-500">あと {daysLeft} 日</span>
          )}
        </div>
        <ChevronRight
          size={18}
          className="text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0 mt-0.5"
        />
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar size={14} className="text-slate-400 flex-shrink-0" />
          {formatDate(event.date)} {event.time}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin size={14} className="text-slate-400 flex-shrink-0" />
          <span className="truncate">{event.venue}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Users size={14} className="text-slate-400 flex-shrink-0" />
          {event.members.join(' / ')}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 bg-slate-50 rounded-lg">
          <div className="text-lg font-bold text-slate-700">{event.incompleteTasks}</div>
          <div className="text-xs text-slate-500">未完了</div>
        </div>
        <div
          className={`text-center p-2 rounded-lg ${event.overdueTasks > 0 ? 'bg-red-50' : 'bg-slate-50'}`}
        >
          <div
            className={`text-lg font-bold ${event.overdueTasks > 0 ? 'text-red-600' : 'text-slate-700'}`}
          >
            {event.overdueTasks}
          </div>
          <div className={`text-xs ${event.overdueTasks > 0 ? 'text-red-500' : 'text-slate-500'}`}>
            期限切れ
          </div>
        </div>
        <div
          className={`text-center p-2 rounded-lg ${event.unassignedTasks > 0 ? 'bg-violet-50' : 'bg-slate-50'}`}
        >
          <div
            className={`text-lg font-bold ${event.unassignedTasks > 0 ? 'text-violet-600' : 'text-slate-700'}`}
          >
            {event.unassignedTasks}
          </div>
          <div
            className={`text-xs ${event.unassignedTasks > 0 ? 'text-violet-500' : 'text-slate-500'}`}
          >
            未担当
          </div>
        </div>
      </div>

      {(event.overdueTasks > 0 || event.unassignedTasks > 0) && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-red-600 font-medium">
          <AlertTriangle size={12} />
          要確認のタスクがあります
        </div>
      )}
    </Link>
  )
}
