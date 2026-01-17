'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

export default function Navigation() {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const navItems = [
    { href: '/', label: '홈' },
    { href: '/schedule', label: '내 시간표' },
    { href: '/groups', label: '그룹' },
  ]

  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register')

  if (isAuthPage) {
    return null
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">
            LinkTime
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {status === 'loading' ? (
              <div className="px-4 py-2 text-sm text-gray-400">로딩중...</div>
            ) : session ? (
              <>
                <span className="text-sm text-gray-600">
                  {session.user?.name}님
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
