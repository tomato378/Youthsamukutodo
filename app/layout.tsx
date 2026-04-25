import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'イベント準備タスク管理 | YouthSamuku',
  description: 'オフライン国際交流イベントの準備タスクを可視化・共有するツール',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  )
}
