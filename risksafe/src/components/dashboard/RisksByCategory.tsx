import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import WidgetCard from '../ui/WidgetCard'
import { Link } from 'react-router-dom'

interface Props {
  data: { category: string; count: number; percentage: number }[]
}

const COLORS = [
  '#6366F1', // Tecnológico — índigo
  '#8B5CF6', // Organizacional — violeta
  '#EC4899', // Pessoas — rosa
  '#F59E0B', // Processos — âmbar
  '#10B981', // Terceiros — esmeralda
  '#3B82F6', // Físico — azul
  '#EF4444', // Legal e Regulamentar — vermelho
  '#14B8A6', // Estratégico — teal
  '#84CC16', // ESG — lima
]

export default function RisksByCategory({ data }: Props) {
  return (
    <WidgetCard
      title="Riscos por Categoria"
      footer={<Link to="/riscos" className="text-xs text-blue-500 hover:underline">Ver relatório completo →</Link>}
    >
      <div className="mt-2" style={{ height: `${Math.max(200, data.length * 34)}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 4, right: 24, top: 2, bottom: 2 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={130} />
            <Tooltip
              formatter={(v: any, _: any, props: any) => [`${v} (${props.payload.percentage}%)`, '']}
              cursor={{ fill: '#f1f5f9' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  )
}
