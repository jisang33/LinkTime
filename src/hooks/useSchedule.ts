'use client'

import { useState, useEffect, useCallback } from 'react'
import { TimeBlock } from '@/types'
import { TIME_SLOTS } from '@/lib/constants'

export function useSchedule() {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 시간표 조회
  const fetchTimeBlocks = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/schedule')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setTimeBlocks(data.timeBlocks)
      setError(null)
    } catch (err) {
      setError('시간표를 불러오는데 실패했습니다')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // 시간 블록 추가
  const addTimeBlock = useCallback(async (
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ) => {
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayOfWeek, startTime, endTime }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? '시간 블록 추가에 실패했습니다')
        return null
      }
      setTimeBlocks((prev) => [...prev, data.timeBlock])
      return data.timeBlock
    } catch (err) {
      setError('시간 블록 추가에 실패했습니다')
      console.error(err)
      return null
    }
  }, [])

  // 시간 블록 수정
  const updateTimeBlock = useCallback(async (
    id: string,
    updates: Partial<Pick<TimeBlock, 'dayOfWeek' | 'startTime' | 'endTime'>>
  ) => {
    try {
      const res = await fetch(`/api/schedule/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? '시간 블록 수정에 실패했습니다')
        return null
      }
      setTimeBlocks((prev) => prev.map((block) => (block.id === id ? data.timeBlock : block)))
      return data.timeBlock as TimeBlock
    } catch (err) {
      setError('시간 블록 수정에 실패했습니다')
      console.error(err)
      return null
    }
  }, [])

  // 시간 블록 삭제
  const removeTimeBlock = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/schedule/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? '시간 블록 삭제에 실패했습니다')
        return false
      }
      setTimeBlocks((prev) => prev.filter((block) => block.id !== id))
      return true
    } catch (err) {
      setError('시간 블록 삭제에 실패했습니다')
      console.error(err)
      return false
    }
  }, [])

  const getAdjacentTime = (time: string, offset: number) => {
    const index = TIME_SLOTS.indexOf(time)
    if (index < 0) return null
    return TIME_SLOTS[index + offset] ?? null
  }

  // 특정 셀(30분 단위)만 삭제
  const removeTimeSlot = useCallback(async (dayOfWeek: number, time: string) => {
    const block = timeBlocks.find((item) => {
      if (item.dayOfWeek !== dayOfWeek) return false
      return time >= item.startTime && time < item.endTime
    })

    if (!block) return false

    const startIndex = TIME_SLOTS.indexOf(block.startTime)
    const endIndex = TIME_SLOTS.indexOf(block.endTime)
    const timeIndex = TIME_SLOTS.indexOf(time)
    const nextTime = getAdjacentTime(time, 1)

    if (startIndex < 0 || endIndex < 0 || timeIndex < 0 || !nextTime) {
      return removeTimeBlock(block.id)
    }

    // 블록이 한 칸이면 삭제
    if (endIndex - startIndex <= 1) {
      return removeTimeBlock(block.id)
    }

    // 첫 칸 삭제
    if (timeIndex === startIndex) {
      return !!(await updateTimeBlock(block.id, { startTime: nextTime }))
    }

    // 마지막 칸 삭제
    if (timeIndex === endIndex - 1) {
      return !!(await updateTimeBlock(block.id, { endTime: time }))
    }

    // 중간 칸 삭제: 블록 분할
    const leftStart = block.startTime
    const leftEnd = time
    const rightStart = nextTime
    const rightEnd = block.endTime

    const removed = await removeTimeBlock(block.id)
    if (!removed) return false

    await addTimeBlock(dayOfWeek, leftStart, leftEnd)
    await addTimeBlock(dayOfWeek, rightStart, rightEnd)
    return true
  }, [timeBlocks, addTimeBlock, removeTimeBlock, updateTimeBlock])

  // 모든 시간 블록 초기화
  const clearAllTimeBlocks = useCallback(async () => {
    try {
      const res = await fetch('/api/schedule', {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete all')
      setTimeBlocks([])
      return true
    } catch (err) {
      setError('초기화에 실패했습니다')
      console.error(err)
      return false
    }
  }, [])

  // 특정 시간이 블록되어 있는지 확인
  const isTimeBlocked = useCallback((dayOfWeek: number, time: string) => {
    return timeBlocks.some((block) => {
      if (block.dayOfWeek !== dayOfWeek) return false
      return time >= block.startTime && time < block.endTime
    })
  }, [timeBlocks])

  // 특정 시간의 블록 ID 찾기
  const getBlockIdAt = useCallback((dayOfWeek: number, time: string) => {
    const block = timeBlocks.find((block) => {
      if (block.dayOfWeek !== dayOfWeek) return false
      return time >= block.startTime && time < block.endTime
    })
    return block?.id
  }, [timeBlocks])

  useEffect(() => {
    fetchTimeBlocks()
  }, [fetchTimeBlocks])

  return {
    timeBlocks,
    loading,
    error,
    addTimeBlock,
    updateTimeBlock,
    removeTimeBlock,
    removeTimeSlot,
    clearAllTimeBlocks,
    isTimeBlocked,
    getBlockIdAt,
    refresh: fetchTimeBlocks,
  }
}
