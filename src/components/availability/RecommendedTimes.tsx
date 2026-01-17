'use client'

interface RecommendedTimesProps {
  items: { label: string; durationMinutes: number }[]
}

export default function RecommendedTimes({ items }: RecommendedTimesProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold mb-4">추천 시간</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">전원 가능 1시간 이상 구간이 없습니다.</p>
      ) : (
        <ul className="space-y-2 text-sm text-gray-700">
          {items.map((item) => (
            <li key={item.label} className="flex items-center justify-between">
              <span>{item.label}</span>
              <span className="text-gray-500">{item.durationMinutes}분</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

