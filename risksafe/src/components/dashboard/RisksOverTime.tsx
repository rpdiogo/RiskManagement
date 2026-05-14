import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import WidgetCard from '../ui/WidgetCard'
import { Link } from 'react-router-dom'

interface Props {
  data: { month: string; critical: number; high: number; medium: number; low: number }[]
}

export default function RisksOverTime({ data }: Props) {
  return (
    <WidgetCard
      title="Riscos ao longo do tempo"
      footer={<Link to="/relatorios" className="text-xs text-blue-500 hover:underline">Ver tendência completa →</Link>}
    >
      <div className="h-52 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="critical" name="Críticos" stroke="#EF4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="high"     name="Altos"    stroke="#F97316" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="medium"   name="Médios"   stroke="#EAB308" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="low"      name="Baixos"   stroke="#22C55E" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  )
}
