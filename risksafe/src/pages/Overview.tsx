import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ShieldAlert, AlertCircle, CheckCircle, Shield } from 'lucide-react'
import KpiCard from '../components/dashboard/KpiCard'
import RiskGauge from '../components/dashboard/RiskGauge'
import RiskMatrix from '../components/dashboard/RiskMatrix'
import RisksByLevel from '../components/dashboard/RisksByLevel'
import TopCriticalRisks from '../components/dashboard/TopCriticalRisks'
import RisksByCategory from '../components/dashboard/RisksByCategory'
import RisksOverTime from '../components/dashboard/RisksOverTime'
import ActionPlansWidget from '../components/dashboard/ActionPlansWidget'
import SecurityIndicators from '../components/dashboard/SecurityIndicators'
import RecentIncidents from '../components/dashboard/RecentIncidents'
import { risksApi } from '../api/risks'
import { mockDashboard } from '../data/mock'

export default function Overview() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: risksApi.dashboard,
  })

  const d = data ?? mockDashboard

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-6 gap-4">
        <KpiCard title="Riscos Totais"   value={d.totalRisks}    trend={12}  inverse icon={<Shield size={20} className="text-blue-600" />}         iconBg="bg-blue-50" />
        <KpiCard title="Riscos Críticos" value={d.criticalRisks} trend={20}  inverse icon={<AlertTriangle size={20} className="text-red-500" />}    iconBg="bg-red-50" />
        <KpiCard title="Riscos Altos"    value={d.highRisks}     trend={-5}  inverse icon={<ShieldAlert size={20} className="text-orange-500" />}   iconBg="bg-orange-50" />
        <KpiCard title="Riscos Médios"   value={d.mediumRisks}   trend={-10} inverse icon={<AlertCircle size={20} className="text-yellow-500" />}   iconBg="bg-yellow-50" />
        <KpiCard title="Riscos Baixos"   value={d.lowRisks}      trend={8}          icon={<CheckCircle size={20} className="text-green-500" />}    iconBg="bg-green-50" />
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col items-center justify-center">
          <p className="text-xs text-slate-500 font-medium mb-1">Nível de Risco Geral</p>
          <RiskGauge score={d.riskScore} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <RiskMatrix matrix={d.riskMatrix} />
        <RisksByLevel total={d.totalRisks} critical={d.criticalRisks} high={d.highRisks} medium={d.mediumRisks} low={d.lowRisks} />
        <TopCriticalRisks risks={d.topCriticalRisks} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <RisksByCategory data={d.risksByCategory} />
        <RisksOverTime data={d.riskTrends} />
        <ActionPlansWidget completion={d.actionPlanCompletion} stats={d.actionPlanStats} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <SecurityIndicators indicators={d.securityIndicators} />
        </div>
        <RecentIncidents incidents={d.recentIncidents} />
      </div>
    </div>
  )
}
