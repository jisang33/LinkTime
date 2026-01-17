'use client'

import { useState, useCallback, useRef } from 'react'
import { useSchedule } from '@/hooks/useSchedule'
import { DAYS_OF_WEEK, DISPLAY_TIME_SLOTS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface DragState {
  isDragging: boolean
  startDay: number | null
  startTimeIndex: number | null
  currentDay: number | null
  currentTimeIndex: number | null
}

export default function WeeklySchedule() {
  const {
    loading,
    error,
    addTimeBlock,
    removeTimeSlot,
    clearAllTimeBlocks,
    isTimeBlocked,
  } = useSchedule()

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startDay: null,
    startTimeIndex: null,
    currentDay: null,
    currentTimeIndex: null,
  })
  const [saving, setSaving] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  // 30분 뒤 시간 계산
  const getNextTimeSlot = (time: string) => {
    const [hour, minute] = time.split(':').map(Number)
    if (minute === 0) {
      return `${hour.toString().padStart(2, '0')}:30`
    } else {
      return `${(hour + 1).toString().padStart(2, '0')}:00`
    }
  }

  // 드래그 시작
  const handleMouseDown = async (dayIndex: number, timeIndex: number) => {
    const time = DISPLAY_TIME_SLOTS[timeIndex]
    const blocked = isTimeBlocked(dayIndex, time)

    // 이미 블록된 곳을 클릭하면 삭제
    if (blocked) {
      await removeTimeSlot(dayIndex, time)
      return
    }

    setDragState({
      isDragging: true,
      startDay: dayIndex,
      startTimeIndex: timeIndex,
      currentDay: dayIndex,
      currentTimeIndex: timeIndex,
    })
  }

  // 드래그 중
  const handleMouseEnter = (dayIndex: number, timeIndex: number) => {
    if (!dragState.isDragging) return

    // 같은 요일에서만 드래그 가능
    if (dayIndex !== dragState.startDay) return

    setDragState((prev) => ({
      ...prev,
      currentDay: dayIndex,
      currentTimeIndex: timeIndex,
    }))
  }

  // 드래그 종료
  const handleMouseUp = useCallback(async () => {
    if (!dragState.isDragging || dragState.startDay === null || dragState.startTimeIndex === null) {
      setDragState({
        isDragging: false,
        startDay: null,
        startTimeIndex: null,
        currentDay: null,
        currentTimeIndex: null,
      })
      return
    }

    const startIdx = Math.min(dragState.startTimeIndex, dragState.currentTimeIndex ?? dragState.startTimeIndex)
    const endIdx = Math.max(dragState.startTimeIndex, dragState.currentTimeIndex ?? dragState.startTimeIndex)

    const startTime = DISPLAY_TIME_SLOTS[startIdx]
    const endTime = getNextTimeSlot(DISPLAY_TIME_SLOTS[endIdx])

    setSaving(true)
    await addTimeBlock(dragState.startDay, startTime, endTime)
    setSaving(false)

    setDragState({
      isDragging: false,
      startDay: null,
      startTimeIndex: null,
      currentDay: null,
      currentTimeIndex: null,
    })
  }, [dragState, addTimeBlock])

  // 드래그 중인 범위에 포함되는지 확인
  const isInDragRange = (dayIndex: number, timeIndex: number) => {
    if (!dragState.isDragging || dragState.startDay !== dayIndex) return false
    if (dragState.startTimeIndex === null || dragState.currentTimeIndex === null) return false

    const minIdx = Math.min(dragState.startTimeIndex, dragState.currentTimeIndex)
    const maxIdx = Math.max(dragState.startTimeIndex, dragState.currentTimeIndex)

    return timeIndex >= minIdx && timeIndex <= maxIdx
  }

  // 초기화 확인
  const handleClear = async () => {
    if (confirm('모든 시간표를 초기화하시겠습니까?')) {
      await clearAllTimeBlocks()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">시간표를 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="select-none">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      {/* 헤더 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">
          드래그하여 불가능한 시간을 선택하세요. 클릭하면 삭제됩니다.
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border rounded-lg hover:bg-gray-50"
          >
            초기화
          </button>
        </div>
      </div>

      {/* 시간표 그리드 */}
      <div
        ref={gridRef}
        className="bg-white rounded-xl shadow-sm border overflow-hidden"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 요일 헤더 */}
        <div className="grid grid-cols-8 border-b bg-gray-50">
          <div className="p-3 text-center text-sm font-medium text-gray-500 border-r">
            시간
          </div>
          {DAYS_OF_WEEK.map((day, index) => (
            <div
              key={day}
              className={cn(
                'p-3 text-center text-sm font-medium',
                index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 시간 슬롯 */}
        <div className="max-h-[600px] overflow-y-auto">
          {DISPLAY_TIME_SLOTS.map((time, timeIndex) => (
            <div key={time} className="grid grid-cols-8 border-b last:border-b-0">
              {/* 시간 레이블 */}
              <div className="p-2 text-center text-xs text-gray-500 border-r bg-gray-50 flex items-center justify-center">
                {time}
              </div>

              {/* 각 요일 셀 */}
              {DAYS_OF_WEEK.map((_, dayIndex) => {
                const blocked = isTimeBlocked(dayIndex, time)
                const inDragRange = isInDragRange(dayIndex, timeIndex)

                return (
                  <div
                    key={`${dayIndex}-${timeIndex}`}
                    className={cn(
                      'h-8 border-r last:border-r-0 cursor-pointer transition-colors',
                      blocked && 'bg-blue-500 hover:bg-blue-600',
                      !blocked && !inDragRange && 'hover:bg-gray-100',
                      inDragRange && !blocked && 'bg-blue-300'
                    )}
                    onMouseDown={() => handleMouseDown(dayIndex, timeIndex)}
                    onMouseEnter={() => handleMouseEnter(dayIndex, timeIndex)}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded" />
          <span>불가능한 시간</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border rounded" />
          <span>가능한 시간</span>
        </div>
        {saving && (
          <div className="text-blue-500 ml-auto">저장 중...</div>
        )}
      </div>
    </div>
  )
}
