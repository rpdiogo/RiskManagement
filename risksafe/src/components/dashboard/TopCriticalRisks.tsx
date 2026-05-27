import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import WidgetCard from '../ui/WidgetCard'
import Badge from '../ui/Badge'
import { Link, useNavigate } from 'react-router-dom'
import type { TrendDirection, RiskLevel } from '../../types'

interface TopRisk {
  id: string
  name: string
  level: RiskLevel
  score: number
  trend: TrendDirection
}

const TrendIcon = ({ trend }: { trend: TrendDirection }) => {
  if (trend === 'up')   return <TrendingUp size={14} className="text-red-500" />
  if (trend === 'down') return <TrendingDown size={14} className="text-green-500" />
  return <Minus size={14} className="text-slate-400" />
}

export default function TopCriticalRisks({ risks }: { risks: TopRisk[] }) {
  const navigate = useNavigate()
  return (
    <WidgetCard
      title="Top 5 Riscos Críticos"
      footer={<Link to="/riscos" className="text-xs text-blue-500 hover:underline">Ver todos os riscos →</Link>}
    >
      <table className="w-full text-sm mt-1">
        <thead>
          <tr className="text-xs text-slate-400 border-b border-slate-100">
            <th className="text-left pb-2 font-medium">Risco</th>
            <th className="text-left pb-2 font-medium">Nível</th>
            <th className="text-right pb-2 font-medium">Score</th>
            <th className="text-right pb-2 font-medium">Tend.</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {risks.map(r => (
            <tr
              key={r.id}
              className="hover:bg-blue-50 transition-colors cursor-pointer group"
              onClick={() => navigate(`/riscos?risk=${r.id}`)}
              title="Ver risco"
            >
              <td className="py-2 pr-3 text-xs text-slate-700 max-w-[160px] truncate group-hover:text-blue-700">{r.name}</td>
              <td className="py-2 pr-3"><Badge level={r.level} /></td>
              <td className="py-2 text-right font-semibold text-slate-800 text-sm">{r.score}</td>
              <td className="py-2 text-right"><TrendIcon trend={r.trend} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </WidgetCard>
  )
}
