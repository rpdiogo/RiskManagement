import WidgetCard from '../ui/WidgetCard'
import Badge from '../ui/Badge'
import { Link } from 'react-router-dom'
import type { Incident } from '../../types'

export default function RecentIncidents({ incidents }: { incidents: Incident[] }) {
  return (
    <WidgetCard
      title="Últimos Incidentes"
      footer={<Link to="/incidentes" className="text-xs text-blue-500 hover:underline">Ver todos os incidentes →</Link>}
    >
      <div className="space-y-3 mt-2">
        {incidents.map(inc => (
          <div key={inc.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                inc.level === 'critical' ? 'bg-red-500' :
                inc.level === 'high'     ? 'bg-orange-500' :
                inc.level === 'medium'   ? 'bg-yellow-400' : 'bg-green-500'
              }`} />
              <span className="text-xs text-slate-700 truncate">{inc.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400">{inc.date}</span>
              <Badge level={inc.level} />
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}
