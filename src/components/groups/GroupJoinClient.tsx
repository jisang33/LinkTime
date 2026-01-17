'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function GroupJoinClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCode = (searchParams.get('code') ?? '').toUpperCase()

  const [inviteCode, setInviteCode] = useState(initialCode)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const joinGroup = async (code: string) => {
    if (!code) {
      setMessage('초대 코드를 입력해주세요')
      setStatus('error')
      return
    }

    setStatus('loading')
    setMessage(null)

    try {
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error ?? '그룹 참여에 실패했습니다')
        setStatus('error')
        return
      }
      setStatus('success')
      router.push(`/groups/${data.group?.id ?? ''}`)
    } catch {
      setMessage('그룹 참여 중 오류가 발생했습니다')
      setStatus('error')
    }
  }

  useEffect(() => {
    if (initialCode) {
      joinGroup(initialCode)
    }
  }, [initialCode])

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">그룹 참여</h1>
        <p className="text-gray-500 mb-6">초대 코드를 입력해서 그룹에 참여하세요.</p>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm border ${
            status === 'error'
              ? 'bg-red-50 border-red-200 text-red-600'
              : 'bg-green-50 border-green-200 text-green-600'
          }`}>
            {message}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            joinGroup(inviteCode.trim().toUpperCase())
          }}
          className="space-y-4"
        >
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
            disabled={status === 'loading'}
            className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {status === 'loading' ? '참여 중...' : '그룹 참여'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/groups" className="text-sm text-blue-600 hover:underline">
            그룹 목록으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
