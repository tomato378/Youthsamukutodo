import { Task } from '@/lib/types'
import { getRiskLevel, getRiskBadgeClass, getRiskLabel } from '@/lib/taskUtils'

interface Props {
  task: Task
}

export default function TaskRiskBadge({ task }: Props) {
  const level = getRiskLevel(task)
  if (level === 'normal') return null
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRiskBadgeClass(level)}`}
    >
      {getRiskLabel(level)}
    </span>
  )
}
