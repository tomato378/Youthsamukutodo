'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Loader2, LogIn, LogOut } from 'lucide-react'

export default function GoogleConnectButton({ compact = false }: { compact?: boolean }) {
  const { googleSession, connectGoogle, disconnectGoogle } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConnect() {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      setError('Google Client ID が設定されていません')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await connectGoogle()
    } catch (e) {
      setError(e instanceof Error ? e.message : '接続に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (googleSession) {
    return (
      <div className={`flex items-center gap-2 ${compact ? '' : 'flex-col'}`}>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 ${compact ? '' : 'w-full'}`}>
          <span className="text-green-600 text-base leading-none">G</span>
          <span className="text-xs text-green-700 font-medium truncate flex-1 min-w-0">
            {googleSession.email}
          </span>
        </div>
        <button
          onClick={disconnectGoogle}
          className={`flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors ${compact ? 'flex-shrink-0' : 'self-end'}`}
          title="Google連携を解除"
        >
          <LogOut size={11} />
          {!compact && '切断'}
        </button>
      </div>
    )
  }

  return (
    <div className={compact ? '' : 'w-full'}>
      <button
        onClick={handleConnect}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors disabled:opacity-50 ${compact ? '' : 'w-full justify-center'}`}
      >
        {loading ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <span className="font-bold text-sm leading-none" style={{ fontFamily: 'sans-serif' }}>G</span>
        )}
        {loading ? '接続中...' : 'Googleと連携する'}
        {!loading && <LogIn size={12} />}
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
