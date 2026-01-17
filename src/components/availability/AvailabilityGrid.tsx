'use client'

import { DAYS_OF_WEEK, DISPLAY_TIME_SLOTS } from '@/lib/constants'
import type { DayAvailability } from '@/types'

interface AvailabilityGridProps {
  availability: DayAvailability[]
  totalMembers: number
  minMembers: number
}

const getColorClass = (availableCount: number, totalMembers: number, minMembers: number) => {
  if (availableCount < minMembers) return 'bg-gray-200'
  if (availableCount === totalMembers) return 'bg-green-500'
  if (availableCount > totalMembers / 2) return 'bg-yellow-400'
  return 'bg-red-500'
}

export default function AvailabilityGrid({
  availability,
  totalMembers,
  minMembers,
}: AvailabilityGridProps) {
  const dayMap = new Map<number, Map<string, { availableCount: number; availableMembers: string[] }>>()

  availability.forEach((day) => {
    const slotMap = new Map<string, { availableCount: number; availableMembers: string[] }>()
    day.slots.forEach((slot) => {
      slotMap.set(slot.startTime, {
        availableCount: slot.availableCount,
        availableMembers: slot.availableMembers,
      })
    })
    dayMap.set(day.dayOfWeek, slotMap)
  })

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="grid grid-cols-8 border-b bg-gray-50">
        <div className="p-3 text-center text-sm font-medium text-gray-500 border-r">시간</div>
        {DAYS_OF_WEEK.map((day, index) => (
          <div
            key={day}
            className={`p-3 text-center text-sm font-medium ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {DISPLAY_TIME_SLOTS.map((time) => (
          <div key={time} className="grid grid-cols-8 border-b last:border-b-0">
            <div className="p-2 text-center text-xs text-gray-500 border-r bg-gray-50 flex items-center justify-center">
              {time}
            </div>
            {DAYS_OF_WEEK.map((_, dayIndex) => {
              const slot = dayMap.get(dayIndex)?.get(time)
              const availableCount = slot?.availableCount ?? 0
              const members = slot?.availableMembers ?? []
              const colorClass = getColorClass(availableCount, totalMembers, minMembers)
              const title = members.length
                ? `가능: ${members.join(', ')} (${availableCount}명)`
                : '가능한 멤버 없음'

              return (
                <div
                  key={`${dayIndex}-${time}`}
                  className={`h-8 border-r last:border-r-0 ${colorClass}`}
                  title={title}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

