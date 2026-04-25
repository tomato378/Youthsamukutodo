'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { isOverdue, isDueToday, isDueSoon, isUnassigned, isWaitingReview } from '@/lib/taskUtils'
import { LayoutDashboard, CalendarDays, AlertTriangle, Plus } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()
  const { tasks } = useApp()

  const dangerCount = tasks.filter(
    (t) =>
      t.status !== 'done' &&
      (isOverdue(t) || isDueToday(t) || isDueSoon(t) || isUnassigned(t) || isWaitingReview(t))
  ).length

  const items = [
    { href: '/', label: 'ホーム', icon: LayoutDashboard },
    { href: '/events', label: 'イベント', icon: CalendarDays },
    { href: '/?danger=1', label: '危険', icon: AlertTriangle, badge: dangerCount },
    { href: '/events/new', label: '作成', icon: Plus },
  ]

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-slate-200 bg-slate-100">
      {items.map(({ href, label, icon: Icon, badge }) => {
        const active =
          href === '/'
            ? pathname === '/'
            : pathname.startsWith(href.split('?')[0]) && href.split('?')[0] !== '/'
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center justify-center py-2 gap-0.5 text-[11px] relative transition-colors ${
              active ? 'text-indigo-700 font-bold' : 'text-slate-500'
            }`}
          >
            <div className="relative">
              <Icon size={20} />
              {badge != null && badge > 0 && (
                <span className="absolute -top-1 -right-1.5 text-[9px] bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
