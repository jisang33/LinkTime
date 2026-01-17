'use client'

export default function Legend() {
  return (
    <div className="flex items-center gap-6 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-green-500 rounded" />
        <span>전원 가능</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-yellow-400 rounded" />
        <span>과반수 가능</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-red-500 rounded" />
        <span>소수 가능</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-200 rounded" />
        <span>필터 제외</span>
      </div>
    </div>
  )
}

