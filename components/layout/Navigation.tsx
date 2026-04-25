'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function Navigation() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 h-14">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-indigo-600 text-lg">
          <span className="text-xl">🌏</span>
          <span>YouthSamuku</span>
        </Link>

        {/* Desktop: "+ New event" button shown in sidebar; show here on mobile only */}
        <Link
          href="/events/new"
          className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={15} />
          作成
        </Link>

        {/* Desktop shortcut */}
        <Link
          href="/events/new"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={15} />
          新規イベント作成
        </Link>
      </div>
    </header>
  )
}
