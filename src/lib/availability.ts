import { DISPLAY_TIME_SLOTS, TIME_SLOTS } from '@/lib/constants'
import type { DayAvailability, TimeBlock, TimeSlot } from '@/types'

interface MemberWithBlocks {
  id: string
  name: string
  timeBlocks: Pick<TimeBlock, 'dayOfWeek' | 'startTime' | 'endTime'>[]
}

const getEndTime = (time: string) => {
  const index = TIME_SLOTS.indexOf(time)
  if (index < 0) return time
  return TIME_SLOTS[index + 1] ?? '24:00'
}

const isBlocked = (
  blocks: MemberWithBlocks['timeBlocks'],
  dayOfWeek: number,
  time: string
) => {
  return blocks.some((block) => {
    if (block.dayOfWeek !== dayOfWeek) return false
    return time >= block.startTime && time < block.endTime
  })
}

export function computeAvailability(
  members: MemberWithBlocks[],
  timeSlots: string[] = DISPLAY_TIME_SLOTS
) {
  const availability: DayAvailability[] = Array.from({ length: 7 }, (_, dayOfWeek) => {
    const slots: TimeSlot[] = timeSlots.map((time) => {
      const availableMembers = members
        .filter((member) => !isBlocked(member.timeBlocks, dayOfWeek, time))
        .map((member) => member.name)

      return {
        startTime: time,
        endTime: getEndTime(time),
        availableCount: availableMembers.length,
        availableMembers,
      }
    })

    return { dayOfWeek, slots }
  })

  return {
    totalMembers: members.length,
    availability,
  }
}

