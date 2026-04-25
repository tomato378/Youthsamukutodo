'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { isOverdue, isDueToday, isDueSoon, isUnassigned, isWaitingReview } from '@/lib/taskUtils'
import { LayoutDashboard, CalendarDays, AlertTriangle, Plus } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const { tasks } = useApp()

  const activeTasks = tasks.filter((t) => t.status !== 'done')
  const dangerCount = activeTasks.filter(
    (t) => isOverdue(t) || isDueToday(t) || isDueSoon(t) || isUnassigned(t) || isWaitingReview(t)
  ).length

  const links = [
    { href: '/', label: 'ダッシュボード', icon: LayoutDashboard },
    { href: '/events', label: 'イベント一覧', icon: CalendarDays },
    { href: '/?danger=1', label: '危険タスク', icon: AlertTriangle, badge: dangerCount },
  ]

  return (
    <aside className="hidden sm:flex flex-col w-40 flex-shrink-0 bg-slate-100 border-r border-slate-200 pt-3 pb-4 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
      <nav className="flex flex-col gap-0.5 px-2">
        {links.map(({ href, label, icon: Icon, badge }) => {
          const active =
            href === '/'
              ? pathname === '/' || href === pathname
              : pathname.startsWith(href.split('?')[0])
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon size={15} />
                {label}
              </span>
              {badge != null && badge > 0 && (
                <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-medium leading-none">
                  {badge}
                </span>
              )}
            </Link>
          )
        })}

        <div className="h-px bg-slate-300 my-2 mx-1" />

        <Link
          href="/events/new"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
        >
          <Plus size={14} />
          新規イベント
        </Link>
      </nav>
    </aside>
  )
}
