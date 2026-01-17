import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { computeAvailability } from '@/lib/availability'

type TimeBlockData = {
  dayOfWeek: number
  startTime: string
  endTime: string
}

type UserWithTimeBlocks = {
  id: string
  name: string
  timeBlocks: TimeBlockData[]
}

type GroupMemberWithUser = {
  user: UserWithTimeBlocks | null
  userId: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: groupId } = await params

    if (!groupId) {
      return NextResponse.json({ error: 'Group id is required' }, { status: 400 })
    }

    const groupIdentifier = groupId.trim()
    const group = await prisma.group.findFirst({
      where: {
        OR: [{ id: groupIdentifier }, { inviteCode: groupIdentifier }],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            timeBlocks: {
              select: {
                dayOfWeek: true,
                startTime: true,
                endTime: true,
              },
            },
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                timeBlocks: {
                  select: {
                    dayOfWeek: true,
                    startTime: true,
                    endTime: true,
                  },
                },
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
      },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const membersTyped = group.members as GroupMemberWithUser[]

    const isMember = membersTyped.some(
      (member) => member.user?.id === session.user.id || member.userId === session.user.id
    )

    if (!isMember && group.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const memberSchedules = membersTyped.map((member) => ({
      id: member.user?.id ?? member.userId,
      name: member.user?.name ?? '이름 없음',
      timeBlocks: member.user?.timeBlocks ?? [],
    }))

    const ownerTyped = group.owner as UserWithTimeBlocks | null

    if (ownerTyped && !memberSchedules.some((member) => member.id === ownerTyped.id)) {
      memberSchedules.unshift({
        id: ownerTyped.id,
        name: ownerTyped.name ?? '이름 없음',
        timeBlocks: ownerTyped.timeBlocks ?? [],
      })
    }

    const result = computeAvailability(memberSchedules)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch availability:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}
