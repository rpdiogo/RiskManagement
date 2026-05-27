import { Flame, ShieldAlert, Server, ShieldOff, Target } from 'lucide-react'
import WidgetCard from '../ui/WidgetCard'
import TrendIndicator from '../ui/TrendIndicator'

interface Props {
  indicators: {
    incidents: number; incidentsTrend: number
    criticalVulns: number; criticalVulnsTrend: number
    highRiskAssets: number; highRiskAssetsTrend: number
    ineffectiveControls: number; ineffectiveControlsTrend: number
    treatmentRate: number; treatmentRateTrend: number
  }
}

export default function SecurityIndicators({ indicators: i }: Props) {
  const items = [
    { icon: Flame,     label: 'Incidentes no período',  value: i.incidents,           trend: i.incidentsTrend,           unit: '%', inverse: true },
    { icon: ShieldAlert, label: 'Riscos Críticos',          value: i.criticalVulns,    trend: i.criticalVulnsTrend,       unit: '%', inverse: true },
    { icon: Server,    label: 'Riscos Elevados',         value: i.highRiskAssets,      trend: i.highRiskAssetsTrend,      unit: '%', inverse: true },
    { icon: ShieldOff, label: 'Controles Ineficazes',   value: i.ineffectiveControls, trend: i.ineffectiveControlsTrend, unit: '%', inverse: true },
    { icon: Target,    label: 'Taxa de Tratamento',     value: `${i.treatmentRate}%`, trend: i.treatmentRateTrend,       unit: 'p.p.' },
  ]

  return (
    <WidgetCard title="Indicadores de Segurança">
      <div className="grid grid-cols-5 gap-4 mt-2">
        {items.map(item => (
          <div key={item.label} className="flex flex-col items-center text-center gap-1">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <item.icon size={18} className="text-slate-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{item.value}</p>
            <p className="text-xs text-slate-500 leading-tight">{item.label}</p>
            <TrendIndicator value={item.trend} unit={item.unit} inverse={item.inverse} />
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}
