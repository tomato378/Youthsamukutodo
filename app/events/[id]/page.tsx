import EventDetailClient from './EventDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params
  return <EventDetailClient eventId={id} />
}
