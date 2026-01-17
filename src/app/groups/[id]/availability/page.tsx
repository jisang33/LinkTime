import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AvailabilityPageClient from '@/components/availability/AvailabilityPageClient'

export default async function GroupAvailabilityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const resolvedParams = await params

  return <AvailabilityPageClient groupId={resolvedParams.id} />
}

