'use client'

import { useState, useCallback, useRef } from 'react'
import { useSchedule } from '@/hooks/useSchedule'
import { DAYS_OF_WEEK, DISPLAY_TIME_SLOTS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface DragState {
  isDragging: boolean
  isDeleteMode: boolean
  startDay: number | null
  startTimeIndex: number | null
  currentDay: number | null
  currentTimeIndex: number | null
  deletedCells: Set<string>
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
    isDeleteMode: false,
    startDay: null,
    startTimeIndex: null,
    currentDay: null,
    currentTimeIndex: null,
    deletedCells: new Set(),
  })
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
  const handleMouseDown = (dayIndex: number, timeIndex: number) => {
    const time = DISPLAY_TIME_SLOTS[timeIndex]
    const blocked = isTimeBlocked(dayIndex, time)

    if (blocked) {
      // 삭제 모드 시작
      removeTimeSlot(dayIndex, time)
      setDragState({
        isDragging: true,
        isDeleteMode: true,
        startDay: dayIndex,
        startTimeIndex: timeIndex,
        currentDay: dayIndex,
        currentTimeIndex: timeIndex,
        deletedCells: new Set([`${dayIndex}-${timeIndex}`]),
      })
    } else {
      // 추가 모드 시작
      setDragState({
        isDragging: true,
        isDeleteMode: false,
        startDay: dayIndex,
        startTimeIndex: timeIndex,
        currentDay: dayIndex,
        currentTimeIndex: timeIndex,
        deletedCells: new Set(),
      })
    }
  }

  // 드래그 중
  const handleMouseEnter = (dayIndex: number, timeIndex: number) => {
    if (!dragState.isDragging) return

    // 같은 요일에서만 드래그 가능
    if (dayIndex !== dragState.startDay) return

    const time = DISPLAY_TIME_SLOTS[timeIndex]
    const cellKey = `${dayIndex}-${timeIndex}`

    if (dragState.isDeleteMode) {
      // 삭제 모드: 블록된 셀만 삭제
      const blocked = isTimeBlocked(dayIndex, time)
      if (blocked && !dragState.deletedCells.has(cellKey)) {
        removeTimeSlot(dayIndex, time)
        setDragState((prev) => ({
          ...prev,
          currentDay: dayIndex,
          currentTimeIndex: timeIndex,
          deletedCells: new Set([...prev.deletedCells, cellKey]),
        }))
      }
    } else {
      // 추가 모드
      setDragState((prev) => ({
        ...prev,
        currentDay: dayIndex,
        currentTimeIndex: timeIndex,
      }))
    }
  }

  // 드래그 종료
  const handleMouseUp = useCallback(async () => {
    if (!dragState.isDragging) {
      return
    }

    // 삭제 모드면 이미 처리됨
    if (dragState.isDeleteMode) {
      setDragState({
        isDragging: false,
        isDeleteMode: false,
        startDay: null,
        startTimeIndex: null,
        currentDay: null,
        currentTimeIndex: null,
        deletedCells: new Set(),
      })
      return
    }

    // 추가 모드
    if (dragState.startDay === null || dragState.startTimeIndex === null) {
      setDragState({
        isDragging: false,
        isDeleteMode: false,
        startDay: null,
        startTimeIndex: null,
        currentDay: null,
        currentTimeIndex: null,
        deletedCells: new Set(),
      })
      return
    }

    const startIdx = Math.min(dragState.startTimeIndex, dragState.currentTimeIndex ?? dragState.startTimeIndex)
    const endIdx = Math.max(dragState.startTimeIndex, dragState.currentTimeIndex ?? dragState.startTimeIndex)

    const startTime = DISPLAY_TIME_SLOTS[startIdx]
    const endTime = getNextTimeSlot(DISPLAY_TIME_SLOTS[endIdx])

    addTimeBlock(dragState.startDay, startTime, endTime)

    setDragState({
      isDragging: false,
      isDeleteMode: false,
      startDay: null,
      startTimeIndex: null,
      currentDay: null,
      currentTimeIndex: null,
      deletedCells: new Set(),
    })
  }, [dragState, addTimeBlock])

  // 드래그 중인 범위에 포함되는지 확인 (추가 모드용)
  const isInDragRange = (dayIndex: number, timeIndex: number) => {
    if (!dragState.isDragging || dragState.isDeleteMode) return false
    if (dragState.startDay !== dayIndex) return false
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
          드래그하여 시간을 선택/삭제하세요.
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
                      'h-8 border-r last:border-r-0 cursor-pointer transition-colors duration-75',
                      blocked && 'bg-blue-500 hover:bg-blue-400',
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
      </div>
    </div>
  )
}
