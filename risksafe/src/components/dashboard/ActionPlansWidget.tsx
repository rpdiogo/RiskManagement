import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import WidgetCard from '../ui/WidgetCard'
import { Link } from 'react-router-dom'

interface Props {
  completion: number
  stats: { completed: number; inProgress: number; delayed: number; notStarted: number }
}

const SEGMENTS = [
  { key: 'completed',  label: 'Concluídas',     color: '#22C55E' },
  { key: 'inProgress', label: 'Em Andamento',   color: '#6366F1' },
  { key: 'delayed',    label: 'Atrasadas',       color: '#EF4444' },
  { key: 'notStarted', label: 'Não Iniciadas',   color: '#94A3B8' },
]

export default function ActionPlansWidget({ completion, stats }: Props) {
  const total = stats.completed + stats.inProgress + stats.delayed + stats.notStarted
  const data = SEGMENTS.map(s => ({ ...s, value: stats[s.key as keyof typeof stats] }))

  return (
    <WidgetCard
      title="Planos de Ação"
      footer={<Link to="/planos" className="text-xs text-blue-500 hover:underline">Ver todos os planos →</Link>}
    >
      <div className="flex items-center gap-4 mt-2">
        <div className="relative w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" strokeWidth={2}>
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xl font-bold text-slate-800">{completion}%</p>
            <p className="text-xs text-slate-400 text-center leading-tight">Conclusão<br/>Geral</p>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {data.map(d => (
            <div key={d.key} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-slate-600">{d.label}</span>
              </div>
              <span className="font-semibold text-slate-700">{d.value} ({Math.round(d.value / total * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </WidgetCard>
  )
}
