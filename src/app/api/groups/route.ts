import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateInviteCode } from '@/lib/utils'

async function createUniqueInviteCode() {
  for (let i = 0; i < 5; i++) {
    const code = generateInviteCode()
    const existing = await prisma.group.findUnique({
      where: { inviteCode: code },
      select: { id: true },
    })
    if (!existing) return code
  }
  throw new Error('Failed to generate unique invite code')
}

// GET: 내가 속한 그룹 목록
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const members = await prisma.groupMember.findMany({
      where: { userId: session.user.id },
      include: {
        group: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    })

    const groups = members.map((member) => ({
      id: member.group.id,
      name: member.group.name,
      inviteCode: member.group.inviteCode,
      ownerId: member.group.ownerId,
      createdAt: member.group.createdAt,
      memberCount: member.group._count.members,
      role: member.role,
    }))

    return NextResponse.json({ groups })
  } catch (error) {
    console.error('Failed to fetch groups:', error)
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
  }
}

// POST: 새 그룹 생성
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const name = (body?.name ?? '').trim()

    if (!name) {
      return NextResponse.json({ error: '그룹 이름을 입력해주세요' }, { status: 400 })
    }

    const inviteCode = await createUniqueInviteCode()

    const group = await prisma.group.create({
      data: {
        name,
        inviteCode,
        ownerId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: 'admin',
          },
        },
      },
    })

    return NextResponse.json({
      id: group.id,
      name: group.name,
      inviteCode: group.inviteCode,
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create group:', error)
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}
