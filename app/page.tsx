import { AppProvider } from '@/context/AppContext'
import Navigation from '@/components/layout/Navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default function DashboardPage() {
  return (
    <AppProvider>
      <Navigation />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">ダッシュボード</h1>
          <p className="text-slate-500 text-sm">
            全イベントの危険タスクを一括確認できます
          </p>
        </div>
        <DashboardClient />
      </main>
    </AppProvider>
  )
}
