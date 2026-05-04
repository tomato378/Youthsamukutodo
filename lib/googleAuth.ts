export interface GoogleSession {
  accessToken: string
  email: string
  expiresAt: number
}

const SESSION_KEY = 'youthsamuku_google_session'
const SCOPES = 'openid email https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/tasks'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any
  }
}

let scriptLoadPromise: Promise<void> | null = null

export function loadGISScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise
  if (typeof window !== 'undefined' && window.google?.accounts) {
    return Promise.resolve()
  }
  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google Identity Services の読み込みに失敗しました'))
    document.head.appendChild(script)
  })
  return scriptLoadPromise
}

export async function requestGoogleToken(clientId: string): Promise<GoogleSession> {
  await loadGISScript()

  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: async (response: { access_token?: string; expires_in?: number; error?: string }) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error ?? 'トークン取得に失敗しました'))
          return
        }
        try {
          const email = await fetchUserEmail(response.access_token)
          const session: GoogleSession = {
            accessToken: response.access_token,
            email,
            expiresAt: Date.now() + ((response.expires_in ?? 3600) - 60) * 1000,
          }
          saveSession(session)
          resolve(session)
        } catch (e) {
          reject(e)
        }
      },
    })
    client.requestAccessToken()
  })
}

async function fetchUserEmail(token: string): Promise<string> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return 'unknown'
  const data = await res.json()
  return (data.email as string) ?? 'unknown'
}

export function getStoredSession(): GoogleSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as GoogleSession) : null
  } catch {
    return null
  }
}

export function isSessionValid(): boolean {
  const s = getStoredSession()
  return s !== null && Date.now() < s.expiresAt
}

export function saveSession(session: GoogleSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
  // Revoke the token so Google shows the account picker again next time
  const s = getStoredSession()
  if (s && typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(s.accessToken, () => {})
  }
}
