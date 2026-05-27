import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
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
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const data = [
    { name: 'Críticos', value: critical },
    { name: 'Altos',    value: high },
    { name: 'Médios',   value: medium },
    { name: 'Baixos',   value: low },
  ]

  const active = activeIndex !== null ? data[activeIndex] : null
  const centerValue = active ? active.value : total
  const centerLabel = active ? active.name : 'Total'
  const centerColor = active ? COLORS[activeIndex!] : '#1e293b'

  return (
    <WidgetCard
      title="Riscos por Nível"
      footer={<Link to="/riscos" className="text-xs text-blue-500 hover:underline">Ver análise completa →</Link>}
    >
      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={80}
              dataKey="value"
              strokeWidth={2}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i]}
                  opacity={activeIndex === null || activeIndex === i ? 1 : 0.45}
                  style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                />
              ))}
            </Pie>
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value, entry: any) => (
                <span className="text-xs text-slate-600">
                  {value} {entry.payload.value} ({total > 0 ? Math.round(entry.payload.value / total * 100) : 0}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Dynamic center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingBottom: 40 }}>
          <div className="text-center transition-all duration-150">
            <p className="text-2xl font-bold transition-colors duration-150" style={{ color: centerColor }}>
              {centerValue}
            </p>
            <p className="text-xs text-slate-400">{centerLabel}</p>
            {active && total > 0 && (
              <p className="text-xs font-semibold mt-0.5" style={{ color: centerColor }}>
                {Math.round(active.value / total * 100)}%
              </p>
            )}
          </div>
        </div>
      </div>
    </WidgetCard>
  )
}
