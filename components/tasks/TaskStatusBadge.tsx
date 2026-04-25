import { TaskStatus, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '@/lib/types'

interface Props {
  status: TaskStatus
  className?: string
}

export default function TaskStatusBadge({ status, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TASK_STATUS_COLORS[status]} ${className}`}
    >
      {TASK_STATUS_LABELS[status]}
    </span>
  )
}
