import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import GroupDetailClient from '@/components/groups/GroupDetailClient'

export default async function GroupDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  return <GroupDetailClient id={params.id} />
}
