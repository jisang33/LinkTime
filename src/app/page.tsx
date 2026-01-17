'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()
  const startHref = session ? '/schedule' : '/login'

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          LinkTime
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          여러 사람의 공통 빈 시간을 쉽게 찾아보세요
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href={startHref}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            시작하기
          </Link>
          {!session && (
            <Link
              href="/login"
              className="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              로그인
            </Link>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-16">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">시간표 입력</h3>
          <p className="text-gray-600">
            드래그로 간편하게 나의 가능/불가능한 시간을 입력하세요
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">그룹 공유</h3>
          <p className="text-gray-600">
            초대 링크로 그룹을 만들고 멤버들과 시간표를 공유하세요
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">공통 시간 확인</h3>
          <p className="text-gray-600">
            모두가 가능한 시간대를 한눈에 확인하세요
          </p>
        </div>
      </div>

      <section className="mt-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">자세한 기능 소개</h2>
          <p className="text-gray-600 mt-2">
            스터디, 프로젝트, 동아리까지 필요한 기능만 간결하게 제공합니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-2">그룹 기반 일정 공유</h3>
            <p className="text-gray-600">
              초대 코드로 원하는 사람만 모아 시간표를 공유하고, 실시간으로
              변경 내역을 확인할 수 있어요.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-2">공통 시간 자동 계산</h3>
            <p className="text-gray-600">
              멤버가 많아도 공통 가능한 시간대를 자동으로 계산해줘서
              회의 일정 잡기가 쉬워집니다.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-2">직관적인 드래그 UI</h3>
            <p className="text-gray-600">
              30분 단위로 빠르게 입력하고, 클릭 한 번으로 수정할 수 있어요.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-2">팀별 관리 옵션</h3>
            <p className="text-gray-600">
              소규모 팀은 기본 기능만, 조직에서는 확장형 워크플로우로
              관리할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-20 mb-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">가격 안내</h2>
          <p className="text-gray-600 mt-2">상황에 맞는 플랜을 선택하세요.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold">개인</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">무료</p>
            <p className="text-gray-600 mt-2">개인 스터디 및 소규모 모임에 적합</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold">팀</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">$10 / 월</p>
            <p className="text-gray-600 mt-2">팀 협업과 멤버 관리 기능 포함</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold">기업</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">협의</p>
            <p className="text-gray-600 mt-2">보안 및 맞춤 기능 제공</p>
          </div>
        </div>
      </section>
    </div>
  )
}
