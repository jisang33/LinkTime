import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import GroupsPageClient from '@/components/groups/GroupsPageClient'

export default async function GroupsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  return <GroupsPageClient />
}
