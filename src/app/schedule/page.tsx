import WeeklySchedule from '@/components/schedule/WeeklySchedule'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function SchedulePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">내 시간표</h1>
        <p className="text-gray-500 mt-1">불가능한 시간을 표시해주세요</p>
      </div>

      <WeeklySchedule />
    </div>
  )
}
