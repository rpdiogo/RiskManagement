import { AlertTriangle, Clock, Award } from 'lucide-react'
import data from '../../../data/nis2-roadmap-data.json'
import type { Nis2RoadmapData } from '../../../data/nis2-types'

const d = data as Nis2RoadmapData

// Cor por urgência do prazo
function deadlineStyle(deadline: string | null) {
  if (!deadline) return 'bg-slate-100 text-slate-600'
  const lower = deadline.toLowerCase()
  if (lower.includes('imediato')) return 'bg-red-100 text-red-700 border-red-300'
  if (lower.includes('com o registo')) return 'bg-orange-100 text-orange-700 border-orange-300'
  if (lower.includes('20 dias')) return 'bg-amber-100 text-amber-700 border-amber-300'
  if (lower.includes('quando solicitado')) return 'bg-blue-100 text-blue-700 border-blue-300'
  if (lower.includes('periódico')) return 'bg-emerald-100 text-emerald-700 border-emerald-300'
  if (lower.includes('opcional')) return 'bg-slate-100 text-slate-600 border-slate-300'
  return 'bg-slate-100 text-slate-600 border-slate-300'
}

// Cor por nível de conformidade
const levelStyle: Record<string, { bg: string; text: string; icon: string }> = {
  'Básico':      { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: 'bg-emerald-500' },
  'Substancial': { bg: 'bg-amber-50 border-amber-200',     text: 'text-amber-700',   icon: 'bg-amber-500' },
  'Elevado':     { bg: 'bg-red-50 border-red-200',         text: 'text-red-700',     icon: 'bg-red-500' },
}

export default function Nis2Obligations() {
  return (
    <div className="space-y-5">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5 flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-blue-100">
          <AlertTriangle size={20} className="text-blue-600" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800">Obrigações Legais — Entidade Importante</h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Obrigações mínimas decorrentes do <strong>RJC (DL 125/2025)</strong> e <strong>Regulamento CNCS</strong> aplicáveis a entidades qualificadas como importantes ao abrigo da Diretiva NIS2.
            Incumprimento pode resultar em coimas até <strong>7M€ ou 1,4% do volume de negócios</strong>.
          </p>
        </div>
      </div>

      {/* Obligations table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <Clock size={15} className="text-slate-500" />
          <h3 className="font-bold text-slate-800 text-sm">Obrigações Chave & Prazos</h3>
          <span className="text-xs text-slate-400">{d.obligations.length} obrigações</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <th className="text-left px-5 py-2.5">Obrigação</th>
                <th className="text-left px-3 py-2.5">Ref. Legal</th>
                <th className="text-left px-3 py-2.5">Responsável</th>
                <th className="text-left px-3 py-2.5">Prazo</th>
                <th className="text-left px-3 py-2.5">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {d.obligations.map((o, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3 align-top max-w-xs">
                    <p className="font-semibold text-slate-800 text-xs leading-relaxed">{o.obligation}</p>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <span className="inline-block font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {o.legalRef}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <span className="text-xs text-slate-700">{o.owner ?? '—'}</span>
                  </td>
                  <td className="px-3 py-3 align-top">
                    {o.deadline && (
                      <span className={`inline-block text-[10px] font-semibold px-2 py-1 rounded-full border ${deadlineStyle(o.deadline)}`}>
                        {o.deadline}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 align-top max-w-md">
                    <p className="text-xs text-slate-600 leading-relaxed">{o.description ?? '—'}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident notification timeline */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={15} className="text-red-500" />
          <h3 className="font-bold text-slate-800 text-sm">Cronologia de Notificação de Incidentes (Art.42–44 RJC)</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="border-l-4 border-red-500 pl-3">
            <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">≤ 24 horas</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">Alerta Precoce</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Comunicação inicial ao CNCS. Indicar suspeita de ato ilícito e possível impacto transfronteiriço.
            </p>
            <p className="text-[10px] text-slate-400 mt-2 font-mono">Art.42 RJC</p>
          </div>
          <div className="border-l-4 border-amber-500 pl-3">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">≤ 72 horas</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">Notificação Completa</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Avaliação inicial: severidade, impacto, indicadores de exposição (IoCs). Atualiza o alerta precoce.
            </p>
            <p className="text-[10px] text-slate-400 mt-2 font-mono">Art.43 RJC</p>
          </div>
          <div className="border-l-4 border-blue-500 pl-3">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">≤ 1 mês</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">Relatório Final</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Descrição pormenorizada, causa primária, medidas aplicadas e impacto transfronteiriço.
            </p>
            <p className="text-[10px] text-slate-400 mt-2 font-mono">Art.44 RJC</p>
          </div>
        </div>
      </div>

      {/* Compliance levels */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Award size={15} className="text-slate-500" />
          <h3 className="font-bold text-slate-800 text-sm">Níveis de Conformidade — Matriz de Risco CNCS</h3>
          <span className="text-xs text-slate-400">(Anexo II do Regulamento)</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {d.complianceLevels.map(l => {
            const style = levelStyle[l.level] ?? levelStyle['Básico']
            return (
              <div key={l.level} className={`rounded-xl border p-5 ${style.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-3 h-3 rounded-full ${style.icon}`} />
                  <h4 className={`font-bold text-base ${style.text}`}>{l.level}</h4>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{l.description}</p>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
