import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE: 그룹 탈퇴
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

    if (group.ownerId === session.user.id) {
      return NextResponse.json(
        { error: '그룹 생성자는 탈퇴할 수 없습니다' },
        { status: 400 }
      )
    }

    const membership = await prisma.groupMember.findFirst({
      where: { groupId: id, userId: session.user.id },
    })

    if (!membership) {
      return NextResponse.json({ error: '이미 탈퇴했거나 멤버가 아닙니다' }, { status: 404 })
    }

    await prisma.groupMember.delete({ where: { id: membership.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to leave group:', error)
    return NextResponse.json({ error: 'Failed to leave group' }, { status: 500 })
  }
}
