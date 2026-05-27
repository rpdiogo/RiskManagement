import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, ShieldCheck, CheckCircle2, Clock, XCircle, MinusCircle, Paperclip, Building2, Users, Lock, Cpu, Info } from 'lucide-react'
import { controlsApi } from '../../api/controls'
import EvidencePanel from '../../components/evidence/EvidencePanel'
import type { Control, ControlStatus, ControlEffectiveness } from '../../types'

// ─── Config ─────────────────────────────────────────────────────────────────

const statusConfig: Record<ControlStatus, { label: string; cls: string; icon: React.ElementType }> = {
  implemented:     { label: 'Implementado',    cls: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  partial:         { label: 'Parcial',         cls: 'text-amber-700 bg-amber-50 border-amber-200',       icon: Clock },
  planned:         { label: 'Planeado',        cls: 'text-blue-700 bg-blue-50 border-blue-200',          icon: Clock },
  not_implemented: { label: 'Não Implementado',cls: 'text-red-700 bg-red-50 border-red-200',             icon: XCircle },
  not_applicable:  { label: 'N/A',             cls: 'text-slate-500 bg-slate-50 border-slate-200',       icon: MinusCircle },
}

const effectivenessConfig: Record<ControlEffectiveness, { label: string; cls: string }> = {
  effective:        { label: 'Eficaz',         cls: 'text-emerald-700 bg-emerald-50' },
  needs_improvement:{ label: 'Precisa Melhoria',cls: 'text-amber-700 bg-amber-50' },
  ineffective:      { label: 'Ineficaz',       cls: 'text-red-700 bg-red-50' },
  untested:         { label: 'Não Testado',    cls: 'text-slate-500 bg-slate-100' },
}

const sectionMeta: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  '5': { label: '5. Controlos Organizacionais', icon: Building2, cls: 'text-indigo-600 bg-indigo-50' },
  '6': { label: '6. Controlos de Pessoas',      icon: Users,     cls: 'text-pink-600 bg-pink-50' },
  '7': { label: '7. Controlos Físicos',         icon: Lock,      cls: 'text-amber-600 bg-amber-50' },
  '8': { label: '8. Controlos Tecnológicos',    icon: Cpu,       cls: 'text-cyan-600 bg-cyan-50' },
}

const scoreColor = (s: number) => s >= 75 ? 'text-emerald-600' : s >= 50 ? 'text-amber-500' : 'text-red-500'
const scoreBg    = (s: number) => s >= 75 ? 'bg-emerald-500'   : s >= 50 ? 'bg-amber-400'   : 'bg-red-400'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sectionKey(id: string) {
  // "A.5.1" → "5"
  const parts = id.split('.')
  return parts.length >= 2 ? parts[1] : id
}

function controlNumber(id: string) {
  // "A.5.1" → 1, "A.5.37" → 37
  const parts = id.split('.')
  return parts.length >= 3 ? parseInt(parts[2], 10) || 0 : 0
}

// Eficácia como multiplicador (só se aplica a controlos operacionais).
const EFFECTIVENESS_MULT: Record<ControlEffectiveness, number> = {
  effective:         1.0,
  needs_improvement: 0.7,
  ineffective:       0.3,
  untested:          0.6,  // conservador — não sabemos se funciona
}

function controlPoints(c: Control): number | null {
  if (c.status === 'not_applicable')  return null
  if (c.status === 'not_implemented') return 0
  if (c.status === 'planned')         return 25
  const mult = EFFECTIVENESS_MULT[c.effectiveness] ?? 0.6
  if (c.status === 'implemented')     return 100 * mult
  if (c.status === 'partial')         return 50 * mult
  return 0
}

function sectionScore(controls: Control[]) {
  const pts = controls.map(controlPoints).filter((p): p is number => p !== null)
  if (pts.length === 0) return 0
  return Math.round(pts.reduce((s, p) => s + p, 0) / pts.length)
}

function overallScore(controls: Control[]) {
  return sectionScore(controls)
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 40, stroke = 8
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <svg width={100} height={100} className="-rotate-90">
      <circle cx={50} cy={50} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle
        cx={50} cy={50} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  )
}

function SectionGroup({ sectionId, controls, onStatusChange, onEffectivenessChange }: {
  sectionId: string
  controls: Control[]
  onStatusChange: (id: string, status: ControlStatus) => void
  onEffectivenessChange: (id: string, effectiveness: ControlEffectiveness) => void
}) {
  const [open, setOpen] = useState(true)
  const [evidenceOpen, setEvidenceOpen] = useState<Set<string>>(new Set())

  function toggleEvidence(id: string) {
    setEvidenceOpen(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const meta = sectionMeta[sectionId] ?? { label: sectionId, icon: ShieldCheck, cls: 'text-slate-600 bg-slate-100' }
  const Icon = meta.icon
  const score = sectionScore(controls)
  const applicable = controls.filter(c => c.status !== 'not_applicable').length

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {open ? <ChevronDown size={15} className="text-slate-400" /> : <ChevronRight size={15} className="text-slate-400" />}
          <span className={`p-1.5 rounded-lg ${meta.cls}`}>
            <Icon size={15} />
          </span>
          <span className="font-semibold text-slate-800">{meta.label}</span>
          <span className="text-xs text-slate-400">{controls.length} controlo{controls.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${scoreBg(score)}`} style={{ width: `${score}%` }} />
          </div>
          <span className={`text-sm font-bold w-10 text-right ${scoreColor(score)}`}>{score}%</span>
          <span className="text-xs text-slate-400 w-20 text-right">{applicable} aplicáveis</span>
        </div>
      </button>

      {open && (
        <div className="divide-y divide-slate-50">
          {/* Column header */}
          <div className="px-5 py-2 bg-slate-50/70 border-t border-slate-100">
            <div className="grid grid-cols-[7rem_1fr_auto] gap-x-3 items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Código</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Controlo</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-36 text-center">Eficácia</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-40 text-center">Estado</span>
                <span className="w-[26px]" />
              </div>
            </div>
          </div>
          {controls.map(c => {
            const stCfg = statusConfig[c.status]
            const effCfg = effectivenessConfig[c.effectiveness]
            return (
              <div key={c.id} className="px-5 py-3 hover:bg-slate-50/50 transition-colors">
                <div className="grid grid-cols-[7rem_1fr_auto] gap-x-3">
                  {/* Col 1: code */}
                  <div className="pt-0.5">
                    <span className="font-mono text-xs font-semibold text-slate-500 break-all">{c.code}</span>
                  </div>
                  {/* Col 2: name + description */}
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-slate-800 mb-0.5">{c.name}</p>
                    {c.description && (
                      <p className="text-xs text-slate-500 leading-relaxed">{c.description}</p>
                    )}
                    {c.owner && (
                      <p className="text-xs text-slate-400 mt-1">Responsável: {c.owner}</p>
                    )}
                  </div>
                  {/* Col 3: badges + evidence toggle */}
                  <div className="flex items-start gap-2 pt-0.5 shrink-0">
                    <select
                      value={c.effectiveness}
                      onChange={e => onEffectivenessChange(c.id, e.target.value as ControlEffectiveness)}
                      className={`text-xs font-medium rounded-full px-2 py-0.5 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 w-36 text-center ${effCfg.cls}`}
                    >
                      {Object.entries(effectivenessConfig).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                    <select
                      value={c.status}
                      onChange={e => onStatusChange(c.id, e.target.value as ControlStatus)}
                      className={`text-xs font-semibold border rounded-full px-2 py-0.5 pr-5 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 w-40 ${stCfg.cls}`}
                    >
                      {Object.entries(statusConfig).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => toggleEvidence(c.id)}
                      title="Evidências"
                      className={`p-1 rounded-lg transition-colors shrink-0 ${
                        evidenceOpen.has(c.id)
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      <Paperclip size={15} />
                    </button>
                  </div>
                </div>
                {/* Evidence panel — spans full width below the grid */}
                {evidenceOpen.has(c.id) && (
                  <div className="pl-[7rem] mt-1">
                    <EvidencePanel controlId={c.id} controlCode={c.code} />
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Iso27001() {
  const qc = useQueryClient()
  const [filterStatus, setFilterStatus] = useState<ControlStatus | 'all'>('all')

  const { data: controls = [], isLoading } = useQuery({
    queryKey: ['controls'],
    queryFn: controlsApi.list,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ControlStatus }) =>
      controlsApi.patch(id, { status } as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['controls'] }),
  })

  const effectivenessMutation = useMutation({
    mutationFn: ({ id, effectiveness }: { id: string; effectiveness: ControlEffectiveness }) =>
      controlsApi.patch(id, { effectiveness } as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['controls'] }),
  })

  // ISO 27001 controls — id starts with "A."
  const iso = controls.filter(c => (c.id ?? '').startsWith('A.'))
  const filtered = filterStatus === 'all' ? iso : iso.filter(c => c.status === filterStatus)

  const score          = overallScore(iso)
  const total          = iso.length
  const implemented    = iso.filter(c => c.status === 'implemented').length
  const partial        = iso.filter(c => c.status === 'partial').length
  const planned        = iso.filter(c => c.status === 'planned').length
  const notImplemented = iso.filter(c => c.status === 'not_implemented').length
  const notApplicable  = iso.filter(c => c.status === 'not_applicable').length

  // Group by section (5/6/7/8)
  const bySection = filtered.reduce<Record<string, Control[]>>((acc, c) => {
    const key = sectionKey(c.id)
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {})
  // Sort controls inside each section by their numeric tail (5.1 before 5.10)
  Object.values(bySection).forEach(arr => arr.sort((a, b) => controlNumber(a.id) - controlNumber(b.id)))
  const sortedSections = Object.keys(bySection).sort()

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Conformidade ISO/IEC 27001:2022</h1>
          <p className="text-sm text-slate-500 mt-0.5">Annex A · {total} controlos</p>
        </div>
        <div className="group relative">
          <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors">
            <Info size={14} /> Como é calculado o score?
          </button>
          <div className="absolute right-0 top-full mt-2 w-96 bg-slate-800 text-white rounded-xl shadow-xl p-4 text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
            <p className="font-semibold mb-2">Fórmula: <span className="text-blue-300">Status × Eficácia</span></p>
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="text-slate-400">
                  <th className="text-left py-1">Status</th>
                  <th className="text-center">Eficaz</th>
                  <th className="text-center">P. Melhoria</th>
                  <th className="text-center">Ineficaz</th>
                  <th className="text-center">N. Testado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr><td className="py-1">Implementado</td><td className="text-center text-emerald-300">100</td><td className="text-center">70</td><td className="text-center">30</td><td className="text-center">60</td></tr>
                <tr><td className="py-1">Parcial</td>     <td className="text-center">50</td><td className="text-center">35</td><td className="text-center">15</td><td className="text-center">30</td></tr>
              </tbody>
            </table>
            <p className="mt-2 text-slate-300">Planeado = <strong>25</strong> · Não Implementado = <strong>0</strong> · N/A = <em>excluído</em></p>
          </div>
        </div>
      </div>

      {/* Score + KPIs */}
      <div className="grid grid-cols-5 gap-4">
        {/* Score ring */}
        <div className="col-span-1 bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col items-center justify-center gap-2">
          <div className="relative">
            <ScoreRing score={score} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className={`text-xl font-bold ${scoreColor(score)}`}>{score}%</p>
              </div>
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500 text-center">Score Global</p>
        </div>

        {/* KPI cards */}
        {[
          { label: 'Implementados',     value: implemented,    cls: 'text-emerald-600', bar: 'bg-emerald-500' },
          { label: 'Parciais',          value: partial,        cls: 'text-amber-500',   bar: 'bg-amber-400' },
          { label: 'Planeados',         value: planned,        cls: 'text-blue-600',    bar: 'bg-blue-400' },
          { label: 'Não Implementados', value: notImplemented, cls: 'text-red-600',     bar: 'bg-red-400' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-medium text-slate-500 mb-1">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.cls}`}>{kpi.value}</p>
            <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${kpi.bar} rounded-full`} style={{ width: `${total > 0 ? Math.round(kpi.value / total * 100) : 0}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-1">{total > 0 ? Math.round(kpi.value / total * 100) : 0}% do total</p>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-700">Progresso geral de implementação</p>
          <p className={`text-sm font-bold ${scoreColor(score)}`}>{score}%</p>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          {implemented    > 0 && <div className="bg-emerald-500 h-full" style={{ width: `${(implemented    / total) * 100}%` }} title="Implementado" />}
          {partial        > 0 && <div className="bg-amber-400  h-full" style={{ width: `${(partial        / total) * 100}%` }} title="Parcial" />}
          {planned        > 0 && <div className="bg-blue-400   h-full" style={{ width: `${(planned        / total) * 100}%` }} title="Planeado" />}
          {notImplemented > 0 && <div className="bg-red-400    h-full" style={{ width: `${(notImplemented / total) * 100}%` }} title="Não Implementado" />}
          {notApplicable  > 0 && <div className="bg-slate-200  h-full" style={{ width: `${(notApplicable  / total) * 100}%` }} title="N/A" />}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {[
            { label: 'Implementado',      color: 'bg-emerald-500', count: implemented },
            { label: 'Parcial',           color: 'bg-amber-400',   count: partial },
            { label: 'Planeado',          color: 'bg-blue-400',    count: planned },
            { label: 'Não Implementado',  color: 'bg-red-400',     count: notImplemented },
            { label: 'N/A',               color: 'bg-slate-300',   count: notApplicable },
          ].map(l => l.count > 0 && (
            <span key={l.label} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <span className={`w-2 h-2 rounded-full ${l.color}`} />
              {l.label} ({l.count})
            </span>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500 font-medium">Filtrar por estado:</span>
        {(['all', 'implemented', 'partial', 'planned', 'not_implemented', 'not_applicable'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
              filterStatus === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {s === 'all' ? `Todos (${total})` : `${statusConfig[s].label} (${iso.filter(c => c.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sortedSections.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-10 text-center">
            <ShieldCheck size={36} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Nenhum controlo encontrado</p>
          </div>
        ) : (
          sortedSections.map(sectionId => (
            <SectionGroup
              key={sectionId}
              sectionId={sectionId}
              controls={bySection[sectionId]}
              onStatusChange={(id, status) => updateMutation.mutate({ id, status })}
              onEffectivenessChange={(id, effectiveness) => effectivenessMutation.mutate({ id, effectiveness })}
            />
          ))
        )}
      </div>
    </div>
  )
}
