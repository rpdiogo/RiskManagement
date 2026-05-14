import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import WidgetCard from '../ui/WidgetCard'
import { Link } from 'react-router-dom'

interface Props {
  data: { category: string; count: number; percentage: number }[]
}

const COLORS = ['#6366F1', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE']

export default function RisksByCategory({ data }: Props) {
  return (
    <WidgetCard
      title="Riscos por Categoria"
      footer={<Link to="/riscos" className="text-xs text-blue-500 hover:underline">Ver relatório completo →</Link>}
    >
      <div className="h-52 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 20 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={72} />
            <Tooltip
              formatter={(v: any, _: any, props: any) => [`${v} (${props.payload.percentage}%)`, '']}
              cursor={{ fill: '#f1f5f9' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  )
}
