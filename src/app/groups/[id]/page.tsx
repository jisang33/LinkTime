import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import GroupDetailClient from '@/components/groups/GroupDetailClient'

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const { id } = await params
  return <GroupDetailClient id={id} />
}
