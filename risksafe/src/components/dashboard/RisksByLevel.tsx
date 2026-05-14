import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import WidgetCard from '../ui/WidgetCard'
import { Link } from 'react-router-dom'

const COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E']

interface Props {
  total: number
  critical: number
  high: number
  medium: number
  low: number
}

export default function RisksByLevel({ total, critical, high, medium, low }: Props) {
  const data = [
    { name: 'Críticos', value: critical },
    { name: 'Altos',    value: high },
    { name: 'Médios',   value: medium },
    { name: 'Baixos',   value: low },
  ]

  return (
    <WidgetCard
      title="Riscos por Nível"
      footer={<Link to="/riscos" className="text-xs text-blue-500 hover:underline">Ver análise completa →</Link>}
    >
      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={80} dataKey="value" strokeWidth={2}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip formatter={(v: any) => [`${v} (${Math.round(v / total * 100)}%)`, '']} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value, entry: any) => (
                <span className="text-xs text-slate-600">
                  {value} {entry.payload.value} ({Math.round(entry.payload.value / total * 100)}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingBottom: 40 }}>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{total}</p>
            <p className="text-xs text-slate-400">Total</p>
          </div>
        </div>
      </div>
    </WidgetCard>
  )
}
