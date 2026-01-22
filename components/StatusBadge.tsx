import { CheckCircle, Clock, AlertCircle, XCircle, PlayCircle } from 'lucide-react'

interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    PENDING: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      icon: Clock,
      label: 'Pending',
    },
    RUNNING: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: PlayCircle,
      label: 'Running',
    },
    COMPLETED: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: CheckCircle,
      label: 'Completed',
    },
    FAILED: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: XCircle,
      label: 'Failed',
    },
    CANCELLED: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      icon: AlertCircle,
      label: 'Cancelled',
    },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    icon: AlertCircle,
    label: status,
  }

  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-4 h-4 mr-1.5" />
      {config.label}
    </span>
  )
}