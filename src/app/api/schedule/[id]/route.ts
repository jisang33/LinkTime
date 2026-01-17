import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// DELETE: 특정 시간 블록 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams?.id
    if (!id) {
      return NextResponse.json(
        { error: 'Time block id is required' },
        { status: 400 }
      )
    }
    const userId = session.user.id

    // 해당 사용자의 시간 블록인지 확인
    const timeBlock = await prisma.timeBlock.findFirst({
      where: { id, userId },
    })

    if (!timeBlock) {
      return NextResponse.json(
        { error: 'Time block not found' },
        { status: 404 }
      )
    }

    await prisma.timeBlock.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete time block:', error)
    return NextResponse.json(
      { error: 'Failed to delete time block' },
      { status: 500 }
    )
  }
}

// PATCH: 시간 블록 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams?.id
    if (!id) {
      return NextResponse.json(
        { error: 'Time block id is required' },
        { status: 400 }
      )
    }
    const userId = session.user.id
    const body = await request.json()

    // 해당 사용자의 시간 블록인지 확인
    const existingBlock = await prisma.timeBlock.findFirst({
      where: { id, userId },
    })

    if (!existingBlock) {
      return NextResponse.json(
        { error: 'Time block not found' },
        { status: 404 }
      )
    }

    const timeBlock = await prisma.timeBlock.update({
      where: { id },
      data: {
        dayOfWeek: body.dayOfWeek ?? existingBlock.dayOfWeek,
        startTime: body.startTime ?? existingBlock.startTime,
        endTime: body.endTime ?? existingBlock.endTime,
      },
    })

    return NextResponse.json({ timeBlock })
  } catch (error) {
    console.error('Failed to update time block:', error)
    return NextResponse.json(
      { error: 'Failed to update time block' },
      { status: 500 }
    )
  }
}
