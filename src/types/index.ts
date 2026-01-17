export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

export interface Group {
  id: string
  name: string
  inviteCode: string
  ownerId: string
  createdAt: Date
  memberCount?: number
  role?: 'admin' | 'member'
}

export interface GroupMember {
  id: string
  groupId: string
  userId: string
  role: string
  joinedAt: Date
  user?: User
}

export interface TimeBlock {
  id: string
  userId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isRecurring: boolean
  specificDate?: Date | null
}

export interface TimeSlot {
  startTime: string
  endTime: string
  availableCount: number
  availableMembers: string[]
}

export interface DayAvailability {
  dayOfWeek: number
  slots: TimeSlot[]
}
