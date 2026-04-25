import { AppProvider } from '@/context/AppContext'
import Navigation from '@/components/layout/Navigation'
import EventListClient from './EventListClient'

export default function EventsPage() {
  return (
    <AppProvider>
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">イベント一覧</h1>
            <p className="text-slate-500 text-sm mt-1">管理しているイベントの一覧です</p>
          </div>
        </div>
        <EventListClient />
      </main>
    </AppProvider>
  )
}
