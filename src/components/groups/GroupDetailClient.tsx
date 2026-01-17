'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface GroupDetailResponse {
  id: string
  name: string
  inviteCode: string
  members: { id: string; name: string; role: string }[]
  isOwner: boolean
}

export default function GroupDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const [group, setGroup] = useState<GroupDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchGroup = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/groups/${id}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = (await res.json()) as GroupDetailResponse
      setGroup(data)
      setError(null)
    } catch {
      setError('그룹 정보를 불러오지 못했습니다')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroup()
  }, [id])

  const handleCopyInvite = async () => {
    if (!group) return
    const inviteLink = `${window.location.origin}/groups/join?code=${group.inviteCode}`
    try {
      await navigator.clipboard.writeText(inviteLink)
      alert('초대 링크가 복사되었습니다')
    } catch {
      prompt('초대 링크를 복사하세요', inviteLink)
    }
  }

  const handleLeave = async () => {
    if (!group) return
    if (!confirm('정말 그룹에서 나가시겠습니까?')) return

    setActionLoading(true)
    setActionError(null)
    try {
      const res = await fetch(`/api/groups/${group.id}/leave`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(data.error ?? '그룹 탈퇴에 실패했습니다')
        return
      }
      router.push('/groups')
    } catch {
      setActionError('그룹 탈퇴 중 오류가 발생했습니다')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!group) return
    if (!confirm('그룹을 삭제하면 복구할 수 없습니다. 삭제하시겠습니까?')) return

    setActionLoading(true)
    setActionError(null)
    try {
      const res = await fetch(`/api/groups/${group.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(data.error ?? '그룹 삭제에 실패했습니다')
        return
      }
      router.push('/groups')
    } catch {
      setActionError('그룹 삭제 중 오류가 발생했습니다')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/groups" className="text-blue-600 hover:underline text-sm">
          ← 그룹 목록으로
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center text-gray-500">
          그룹 정보를 불러오는 중...
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center text-red-500">
          {error}
        </div>
      ) : group ? (
        <>
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
              <span className="text-sm text-gray-500">멤버 {group.members.length}명</span>
            </div>

            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div>
                <div className="text-sm text-gray-500">초대 코드</div>
                <div className="text-lg font-semibold tracking-widest">{group.inviteCode}</div>
              </div>
              <button
                onClick={handleCopyInvite}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                초대 링크 복사
              </button>
            </div>
          </div>

          {actionError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {actionError}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">멤버 목록</h2>
            <div className="space-y-2">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between border-b last:border-b-0 py-2"
                >
                  <span className="text-gray-700">{member.name}</span>
                  <span className="text-sm text-gray-500">{member.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <Link
              href={`/groups/${group.id}/availability`}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-center"
            >
              공통 시간 보기
            </Link>
            <div className="flex gap-3">
              {!group.isOwner && (
                <button
                  onClick={handleLeave}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  그룹 나가기
                </button>
              )}
              {group.isOwner && (
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  그룹 삭제
                </button>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
