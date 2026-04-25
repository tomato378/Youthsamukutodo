interface Props {
  icon: string
  label: string
  count: number
  color: string
  bgColor: string
  borderColor: string
  onClick?: () => void
}

export default function StatsCard({ icon, label, count, color, bgColor, borderColor, onClick }: Props) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border ${bgColor} ${borderColor} ${
        onClick ? 'hover:shadow-md transition-shadow cursor-pointer w-full' : 'w-full'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className={`text-3xl font-bold ${color}`}>{count}</span>
      <span className={`text-xs font-medium ${color}`}>{label}</span>
    </Tag>
  )
}
