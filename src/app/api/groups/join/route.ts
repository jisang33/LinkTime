import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST: 초대 코드로 그룹 참여
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const inviteCode = (body?.inviteCode ?? '').trim().toUpperCase()

    if (!inviteCode) {
      return NextResponse.json({ error: '초대 코드를 입력해주세요' }, { status: 400 })
    }

    const group = await prisma.group.findUnique({
      where: { inviteCode },
    })

    if (!group) {
      return NextResponse.json({ error: '유효하지 않은 초대 코드입니다' }, { status: 404 })
    }

    const existingMember = await prisma.groupMember.findFirst({
      where: { groupId: group.id, userId: session.user.id },
    })

    if (existingMember) {
      return NextResponse.json({ error: '이미 참여한 그룹입니다' }, { status: 409 })
    }

    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: session.user.id,
        role: 'member',
      },
    })

    return NextResponse.json({ success: true, group: { id: group.id, name: group.name } })
  } catch (error) {
    console.error('Failed to join group:', error)
    return NextResponse.json({ error: 'Failed to join group' }, { status: 500 })
  }
}
