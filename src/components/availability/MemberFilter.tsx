'use client'

interface MemberFilterProps {
  totalMembers: number
  minMembers: number
  onChange: (value: number) => void
}

export default function MemberFilter({ totalMembers, minMembers, onChange }: MemberFilterProps) {
  if (totalMembers <= 0) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">최소 인원</span>
        <span className="text-sm text-gray-600">
          {totalMembers}명 중 {minMembers}명 이상
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={totalMembers}
        value={minMembers}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  )
}

