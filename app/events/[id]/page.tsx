import { AppProvider } from '@/context/AppContext'
import Navigation from '@/components/layout/Navigation'
import EventDetailClient from './EventDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params
  return (
    <AppProvider>
      <Navigation />
      <main className="flex-1">
        <EventDetailClient eventId={id} />
      </main>
    </AppProvider>
  )
}
