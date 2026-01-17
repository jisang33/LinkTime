'use client'

import { useEffect, useMemo, useState } from 'react'
import type { DayAvailability } from '@/types'
import { DAYS_OF_WEEK, DISPLAY_TIME_SLOTS } from '@/lib/constants'
import AvailabilityGrid from '@/components/availability/AvailabilityGrid'
import MemberFilter from '@/components/availability/MemberFilter'
import Legend from '@/components/availability/Legend'
import RecommendedTimes from '@/components/availability/RecommendedTimes'

interface AvailabilityResponse {
  totalMembers: number
  availability: DayAvailability[]
  error?: string
}

const computeRecommendations = (
  availability: DayAvailability[],
  totalMembers: number
) => {
  const recommendations: { label: string; durationMinutes: number }[] = []

  availability.forEach((day) => {
    let startIndex: number | null = null

    DISPLAY_TIME_SLOTS.forEach((time, index) => {
      const slot = day.slots.find((item) => item.startTime === time)
      const isFull = slot?.availableCount === totalMembers

      if (isFull && startIndex === null) {
        startIndex = index
      }

      const isEnd = !isFull || index === DISPLAY_TIME_SLOTS.length - 1
      if (startIndex !== null && isEnd) {
        const endIndex = isFull ? index + 1 : index
        const length = endIndex - startIndex
        if (length >= 2) {
          const startTime = DISPLAY_TIME_SLOTS[startIndex]
          const endTime = DISPLAY_TIME_SLOTS[endIndex - 1]
          const endSlot = day.slots.find((item) => item.startTime === endTime)
          const endLabel = endSlot?.endTime ?? ''
          recommendations.push({
            label: `${DAYS_OF_WEEK[day.dayOfWeek]}요일 ${startTime}~${endLabel}`,
            durationMinutes: length * 30,
          })
        }
        startIndex = null
      }
    })
  })

  return recommendations.sort((a, b) => b.durationMinutes - a.durationMinutes).slice(0, 3)
}

export default function AvailabilityPageClient({ groupId }: { groupId: string }) {
  const [availability, setAvailability] = useState<DayAvailability[]>([])
  const [totalMembers, setTotalMembers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [minMembers, setMinMembers] = useState(1)

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/groups/${groupId}/availability`)
        const data = (await res.json()) as AvailabilityResponse
        if (!res.ok) {
          setError(data?.error ?? '공통 시간을 불러오지 못했습니다')
          return
        }
        setAvailability(data.availability)
        setTotalMembers(data.totalMembers)
        setMinMembers(Math.max(1, Math.ceil(data.totalMembers / 2)))
        setError(null)
      } catch {
        setError('공통 시간을 불러오지 못했습니다')
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [groupId])

  const recommendations = useMemo(
    () => computeRecommendations(availability, totalMembers),
    [availability, totalMembers]
  )

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center text-gray-500">
          공통 시간을 불러오는 중...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center text-red-500">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-600">참여자: {totalMembers}명</div>
        <Legend />
      </div>

      <MemberFilter
        totalMembers={totalMembers}
        minMembers={minMembers}
        onChange={setMinMembers}
      />

      <AvailabilityGrid
        availability={availability}
        totalMembers={totalMembers}
        minMembers={minMembers}
      />

      <RecommendedTimes items={recommendations} />
    </div>
  )
}

