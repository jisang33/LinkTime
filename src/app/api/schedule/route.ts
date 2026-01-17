import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET: 시간 블록 목록 조회
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const timeBlocks = await prisma.timeBlock.findMany({
      where: { userId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    return NextResponse.json({ timeBlocks })
  } catch (error) {
    console.error('Failed to fetch time blocks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time blocks' },
      { status: 500 }
    )
  }
}

// POST: 새 시간 블록 생성
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()
    const { dayOfWeek, startTime, endTime } = body

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'dayOfWeek, startTime, endTime are required' },
        { status: 400 }
      )
    }

    const timeBlock = await prisma.timeBlock.create({
      data: {
        userId,
        dayOfWeek,
        startTime,
        endTime,
        isRecurring: true,
      },
    })

    return NextResponse.json({ timeBlock }, { status: 201 })
  } catch (error) {
    console.error('Failed to create time block:', error)
    return NextResponse.json(
      { error: 'Failed to create time block' },
      { status: 500 }
    )
  }
}

// DELETE: 모든 시간 블록 삭제 (초기화)
export async function DELETE() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    await prisma.timeBlock.deleteMany({
      where: { userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete time blocks:', error)
    return NextResponse.json(
      { error: 'Failed to delete time blocks' },
      { status: 500 }
    )
  }
}
