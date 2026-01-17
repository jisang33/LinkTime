import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import GroupJoinClient from '@/components/groups/GroupJoinClient'

export default async function GroupJoinPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  return <GroupJoinClient />
}
