import type { RiskLevel } from '../../types'

const config: Record<RiskLevel, { label: string; className: string }> = {
  critical: { label: 'Crítico', className: 'bg-red-100 text-red-700 border border-red-200' },
  high:     { label: 'Alto',    className: 'bg-orange-100 text-orange-700 border border-orange-200' },
  medium:   { label: 'Médio',   className: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
  low:      { label: 'Baixo',   className: 'bg-green-100 text-green-700 border border-green-200' },
}

interface BadgeProps {
  level: RiskLevel
  className?: string
}

export default function Badge({ level, className = '' }: BadgeProps) {
  const { label, className: base } = config[level]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${base} ${className}`}>
      {label}
    </span>
  )
}
