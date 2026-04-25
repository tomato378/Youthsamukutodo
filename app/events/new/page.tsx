import { AppProvider } from '@/context/AppContext'
import Navigation from '@/components/layout/Navigation'
import EventForm from '@/components/events/EventForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewEventPage() {
  return (
    <AppProvider>
      <Navigation />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-6 w-full">
        <div className="mb-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
          >
            <ArrowLeft size={14} />
            イベント一覧に戻る
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">イベントを作成する</h1>
          <p className="text-slate-500 text-sm mt-1">
            開催日から逆算して準備タスクを自動生成します
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
          <EventForm />
        </div>
      </main>
    </AppProvider>
  )
}
