import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import Navigation from '@/components/layout/Navigation'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'

export const metadata: Metadata = {
  title: 'イベント準備タスク管理 | YouthSamuku',
  description: 'オフライン国際交流イベントの準備タスクを可視化・共有するツール',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased">
        <AppProvider>
          <Navigation />
          <div className="flex flex-1">
            <Sidebar />
            {/* pb-16 on mobile to clear fixed bottom nav */}
            <main className="flex-1 min-w-0 pb-16 sm:pb-0">
              {children}
            </main>
          </div>
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  )
}
