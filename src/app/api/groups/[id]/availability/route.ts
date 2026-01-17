import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { computeAvailability } from '@/lib/availability'

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

    const isMember = group.members.some(
      (member: { user?: { id: string } | null; userId: string }) => member.user?.id === session.user.id || member.userId === session.user.id
    )

    if (!isMember && group.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const memberSchedules = group.members.map((member: { user?: { id: string; name: string; timeBlocks: { dayOfWeek: number; startTime: string; endTime: string }[] } | null; userId: string }) => ({
      id: member.user?.id ?? member.userId,
      name: member.user?.name ?? '이름 없음',
      timeBlocks: member.user?.timeBlocks ?? [],
    }))

    if (group.owner && !memberSchedules.some((member: { id: string }) => member.id === group.owner?.id)) {
      memberSchedules.unshift({
        id: group.owner.id,
        name: group.owner.name ?? '이름 없음',
        timeBlocks: group.owner.timeBlocks ?? [],
      })
    }

    const result = computeAvailability(memberSchedules)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch availability:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}
