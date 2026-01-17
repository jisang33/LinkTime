import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type GroupMemberWithUser = {
  user: { id: string; name: string; email: string } | null
  userId: string
  role: string
}

// GET: 그룹 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const group = await prisma.group.findFirst({
      where: {
        id,
        members: { some: { userId: session.user.id } },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      },
    })

    if (!group) {
      return NextResponse.json({ error: '그룹을 찾을 수 없습니다' }, { status: 404 })
    }

    const memberList = (group.members as GroupMemberWithUser[]).map((member) => ({
      id: member.user?.id ?? member.userId,
      name: member.user?.name ?? '이름 없음',
      role: member.role,
    }))

    return NextResponse.json({
      id: group.id,
      name: group.name,
      inviteCode: group.inviteCode,
      members: memberList,
      isOwner: group.ownerId === session.user.id,
    })
  } catch (error) {
    console.error('Failed to fetch group:', error)
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 })
  }
}

// DELETE: 그룹 삭제 (owner만)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const group = await prisma.group.findUnique({
      where: { id },
    })

    if (!group) {
      return NextResponse.json({ error: '그룹을 찾을 수 없습니다' }, { status: 404 })
    }

    if (group.ownerId !== session.user.id) {
      return NextResponse.json({ error: '삭제 권한이 없습니다' }, { status: 403 })
    }

    await prisma.group.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete group:', error)
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 })
  }
}
