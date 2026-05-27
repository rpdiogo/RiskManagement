import { Link } from 'react-router-dom'
import TrendIndicator from '../ui/TrendIndicator'
import type { ReactNode } from 'react'

interface KpiCardProps {
  title: string
  value: number | string
  trend?: number | null
  icon: ReactNode
  iconBg: string
  inverse?: boolean
  to?: string
}

export default function KpiCard({ title, value, trend, icon, iconBg, inverse, to }: KpiCardProps) {
  const inner = (
    <>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium truncate">{title}</p>
        <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
        {trend != null
          ? <TrendIndicator value={trend} inverse={inverse} />
          : <p className="text-xs text-slate-400 mt-0.5">sem dados anteriores</p>
        }
      </div>
    </>
  )

  if (to) {
    return (
      <Link
        to={to}
        className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-start gap-4 hover:border-blue-200 hover:shadow-md transition-all group"
      >
        {inner}
      </Link>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-start gap-4">
      {inner}
    </div>
  )
}
