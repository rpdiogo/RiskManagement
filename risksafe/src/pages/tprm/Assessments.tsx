import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, ChevronDown, ChevronRight, ClipboardCheck, AlertTriangle, Clock, CheckCircle2, XCircle } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import { vendorsApi, questionnairesApi } from '../../api/tprm'
import { risksApi } from '../../api/risks'
import type { Vendor, Questionnaire, Risk } from '../../types'

const questionnaireStatusConfig: Record<Questionnaire['status'], { label: string; color: string; icon: React.ElementType }> = {
  draft:       { label: 'Rascunho',   color: 'text-slate-500 bg-slate-100',  icon: Clock },
  sent:        { label: 'Enviado',    color: 'text-blue-600 bg-blue-100',    icon: ClipboardCheck },
  in_progress: { label: 'Em Curso',   color: 'text-amber-600 bg-amber-100',  icon: Clock },
  completed:   { label: 'Concluído',  color: 'text-green-600 bg-green-100',  icon: CheckCircle2 },
  overdue:     { label: 'Em Atraso',  color: 'text-red-600 bg-red-100',      icon: XCircle },
}

export default function Assessments() {
  const [vendorFilter, setVendorFilter] = useState('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const { data: vendors = [], isLoading: loadingVendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: vendorsApi.list,
  })
  const { data: questionnaires = [] } = useQuery({
    queryKey: ['questionnaires'],
    queryFn: questionnairesApi.list,
  })
  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: risksApi.list,
  })

  const filtered = vendorFilter === 'all' ? vendors : vendors.filter(v => v.id === vendorFilter)

  // Map vendor → their questionnaires and risks
  const questsByVendor = (vendorId: string) =>
    questionnaires.filter(q => q.vendorId === vendorId)

  const risksByVendor = (vendorId: string) =>
    risks.filter(r => r.vendorId === vendorId)

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (loadingVendors) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <select
          value={vendorFilter}
          onChange={e => setVendorFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="all">Todos os Fornecedores ({vendors.length})</option>
          {vendors.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Nova Avaliação
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
          <ClipboardCheck size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Sem fornecedores registados</p>
          <p className="text-slate-400 text-sm mt-1">Adicione fornecedores na aba Fornecedores para iniciar avaliações</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(vendor => {
            const vQuests = questsByVendor(vendor.id)
            const vRisks  = risksByVendor(vendor.id)
            const lastQuest = vQuests.sort((a, b) =>
              (b.sentAt ?? '').localeCompare(a.sentAt ?? '')
            )[0]
            const isOpen = expanded.has(vendor.id)

            return (
              <div key={vendor.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => toggle(vendor.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {isOpen ? <ChevronDown size={16} className="text-slate-400 shrink-0" /> : <ChevronRight size={16} className="text-slate-400 shrink-0" />}
                    <div>
                      <p className="font-semibold text-slate-800">{vendor.name}</p>
                      <p className="text-xs text-slate-400">{vendor.category} · {vendor.country}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pr-2">
                    {/* Risk score */}
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-0.5">Score de Risco</p>
                      <p className={`text-lg font-bold ${vendor.riskScore >= 70 ? 'text-red-600' : vendor.riskScore >= 40 ? 'text-amber-600' : 'text-green-600'}`}>
                        {vendor.riskScore}
                      </p>
                    </div>
                    {/* Criticality */}
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-0.5">Criticidade</p>
                      <Badge level={vendor.criticality} />
                    </div>
                    {/* Last questionnaire */}
                    <div className="text-center min-w-[100px]">
                      <p className="text-xs text-slate-400 mb-0.5">Última Avaliação</p>
                      {lastQuest ? (
                        <LastQuestBadge q={lastQuest} />
                      ) : (
                        <span className="text-xs text-slate-400 italic">Sem avaliação</span>
                      )}
                    </div>
                    {/* Risks count */}
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-0.5">Riscos</p>
                      <div className="flex items-center gap-1 justify-center">
                        {vRisks.length > 0
                          ? <><AlertTriangle size={13} className="text-amber-500" /><span className="text-sm font-semibold text-slate-700">{vRisks.length}</span></>
                          : <span className="text-xs text-slate-400">—</span>
                        }
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-slate-100 px-5 pb-5 pt-4 space-y-4">
                    {/* Questionnaires */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Questionários de Segurança</p>
                      {vQuests.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">Nenhum questionário enviado</p>
                      ) : (
                        <div className="space-y-2">
                          {vQuests.map(q => {
                            const cfg = questionnaireStatusConfig[q.status]
                            const Icon = cfg.icon
                            return (
                              <div key={q.id} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                                <span className="text-slate-700">{q.title}</span>
                                <div className="flex items-center gap-3 shrink-0">
                                  {q.score != null && (
                                    <span className={`font-bold ${q.score >= 70 ? 'text-green-600' : q.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                      {q.score}/100
                                    </span>
                                  )}
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                                    <Icon size={11} /> {cfg.label}
                                  </span>
                                  {q.dueDate && (
                                    <span className="text-xs text-slate-400">Prazo: {q.dueDate}</span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Linked risks */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Riscos Associados</p>
                      {vRisks.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">Nenhum risco associado a este fornecedor</p>
                      ) : (
                        <div className="space-y-2">
                          {vRisks.map(r => (
                            <div key={r.id} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                              <span className="text-slate-700 truncate max-w-md">{r.name}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge level={r.level} />
                                <span className="font-bold text-slate-800 w-6 text-right">{r.score}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function LastQuestBadge({ q }: { q: Questionnaire }) {
  const cfg = questionnaireStatusConfig[q.status]
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  )
}
