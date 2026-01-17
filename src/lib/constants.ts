// 임시 사용자 ID (Phase 1-1 인증 구현 전까지 사용)
export const TEMP_USER_ID = "temp-user-1"

export const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'] as const
export const DAYS_OF_WEEK_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

// 30분 단위 시간 슬롯 (00:00 ~ 23:30)
export const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour.toString().padStart(2, '0')}:${minute}`
})

// 표시할 시간 범위 (09:00 ~ 22:00)
export const DISPLAY_START_HOUR = 9
export const DISPLAY_END_HOUR = 24
export const DISPLAY_TIME_SLOTS = TIME_SLOTS.filter((time) => {
  const hour = parseInt(time.split(':')[0])
  return hour >= DISPLAY_START_HOUR && hour < DISPLAY_END_HOUR
})
