import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { TrendDirection } from '../../types'

interface TrendIndicatorProps {
  value: number
  direction?: TrendDirection
  unit?: string
  inverse?: boolean
}

export default function TrendIndicator({ value, direction, unit = '%', inverse = false }: TrendIndicatorProps) {
  const isUp = direction ? direction === 'up' : value > 0
  const isDown = direction ? direction === 'down' : value < 0
  const isStable = direction ? direction === 'stable' : value === 0

  const positiveColor = inverse ? 'text-red-500' : 'text-green-500'
  const negativeColor = inverse ? 'text-green-500' : 'text-red-500'

  const color = isUp ? positiveColor : isDown ? negativeColor : 'text-slate-400'
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus
  const sign = isUp ? '+' : ''

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      <Icon size={12} />
      {!isStable && `${sign}${Math.abs(value)}${unit}`}
      {isStable && '–'}
      <span className="text-slate-400 font-normal">vs mês anterior</span>
    </span>
  )
}
