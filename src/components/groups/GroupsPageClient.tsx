'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Group } from '@/types'

interface GroupListResponse {
  groups: Group[]
}

export default function GroupsPageClient() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/groups')
      if (!res.ok) throw new Error('Failed to fetch groups')
      const data = (await res.json()) as GroupListResponse
      setGroups(data.groups ?? [])
      setError(null)
    } catch {
      setError('그룹 목록을 불러오지 못했습니다')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const resetActionState = () => {
    setActionError(null)
    setActionSuccess(null)
  }

  const openCreateModal = () => {
    resetActionState()
    setGroupName('')
    setIsCreateOpen(true)
  }

  const openJoinModal = () => {
    resetActionState()
    setInviteCode('')
    setIsJoinOpen(true)
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    resetActionState()
    setActionLoading(true)

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName }),
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(data.error ?? '그룹 생성에 실패했습니다')
        return
      }

      setActionSuccess(`그룹이 생성되었습니다. 초대 코드: ${data.inviteCode}`)
      await fetchGroups()
    } catch {
      setActionError('그룹 생성 중 오류가 발생했습니다')
    } finally {
      setActionLoading(false)
    }
  }

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    resetActionState()
    setActionLoading(true)

    try {
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(data.error ?? '그룹 참여에 실패했습니다')
        return
      }

      setActionSuccess(`그룹에 참여했습니다: ${data.group?.name ?? ''}`)
      await fetchGroups()
    } catch {
      setActionError('그룹 참여 중 오류가 발생했습니다')
    } finally {
      setActionLoading(false)
    }
  }

  const hasGroups = useMemo(() => groups.length > 0, [groups.length])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">내 그룹</h1>
        <div className="flex gap-2">
          <button
            onClick={openJoinModal}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border rounded-lg hover:bg-gray-50"
          >
            그룹 참여
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            새 그룹 만들기
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center text-gray-500">
          그룹을 불러오는 중...
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center text-red-500">
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          {hasGroups && (
            <div className="grid gap-4">
              {groups.map((group) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="bg-white rounded-xl shadow-sm border p-5 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{group.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      멤버 {group.memberCount ?? 0}명 · {group.role ?? 'member'}
                    </div>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">상세 보기 →</span>
                </Link>
              ))}
            </div>
          )}

          {!hasGroups && (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">아직 참여한 그룹이 없습니다</h3>
              <p className="text-gray-500 mb-4">새 그룹을 만들거나 초대 코드로 참여하세요</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={openJoinModal}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  초대 코드 입력
                </button>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  새 그룹 만들기
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {(isCreateOpen || isJoinOpen) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {isCreateOpen ? '새 그룹 만들기' : '그룹 참여'}
              </h2>
              <button
                onClick={() => {
                  setIsCreateOpen(false)
                  setIsJoinOpen(false)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {actionError}
              </div>
            )}
            {actionSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
                {actionSuccess}
              </div>
            )}

            {isCreateOpen ? (
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">그룹 이름</label>
                  <input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 스터디 모임"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? '생성 중...' : '그룹 생성'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoinGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">초대 코드</label>
                  <input
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    placeholder="예: ABCD1234"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? '참여 중...' : '그룹 참여'}
                </button>
                <Link
                  href="/groups/join"
                  className="block text-center text-sm text-gray-500 hover:underline"
                >
                  초대 링크로 참여하기
                </Link>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
