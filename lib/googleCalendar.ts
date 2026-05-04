import { Event } from './types'

export async function createCalendarEvent(event: Event, token: string): Promise<string> {
  const [hours, minutes] = event.time.split(':').map(Number)
  const endHours = String((hours + 2) % 24).padStart(2, '0')
  const endMinutes = String(minutes).padStart(2, '0')

  const body = {
    summary: event.name,
    location: event.venue,
    description: event.description ?? '',
    start: { dateTime: `${event.date}T${event.time}:00`, timeZone: 'Asia/Tokyo' },
    end:   { dateTime: `${event.date}T${endHours}:${endMinutes}:00`, timeZone: 'Asia/Tokyo' },
  }

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Google Calendar API エラー: ${err?.error?.message ?? res.status}`)
  }

  const data = await res.json()
  return data.id as string
}
