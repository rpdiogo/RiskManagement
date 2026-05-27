import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus, Pencil, Trash2, Search, ChevronRight,
  CheckCircle2, AlertCircle, XCircle, Clock, MinusCircle,
  Building2, Users, Lock, Cpu, Scale,
  ChevronsUpDown, ChevronUp, ChevronDown,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import Modal from '../components/ui/Modal'
import { controlsApi } from '../api/controls'
import { risksApi } from '../api/risks'
import type { Control, ControlCategory, ControlStatus, ControlEffectiveness } from '../types'

// ─── Form schema ───────────────────────────────────────────────────────────
const controlSchema = z.object({
  code:           z.string().min(2, 'Código obrigatório'),
  name:           z.string().min(3, 'Nome obrigatório'),
  description:    z.string().optional(),
  category:       z.enum(['Organizacional', 'Pessoas', 'Físico', 'Tecnológico', 'Regulamentar']),
  framework_refs: z.string().optional(),
  status:         z.enum(['implemented', 'partial', 'planned', 'not_implemented', 'not_applicable']),
  effectiveness:  z.enum(['effective', 'needs_improvement', 'ineffective', 'untested']),
  owner:          z.string().optional(),
  risk_ids:       z.string().optional(),
  notes:          z.string().optional(),
})
type CFormData = z.infer<typeof controlSchema>

// ─── Visual config ─────────────────────────────────────────────────────────
const categoryConfig: Record<ControlCategory, { icon: React.ElementType; cls: string }> = {
  'Organizacional': { icon: Building2, cls: 'text-indigo-600 bg-indigo-100' },
  'Pessoas':        { icon: Users,     cls: 'text-pink-600 bg-pink-100' },
  'Físico':         { icon: Lock,      cls: 'text-blue-600 bg-blue-100' },
  'Tecnológico':    { icon: Cpu,       cls: 'text-teal-600 bg-teal-100' },
  'Regulamentar':   { icon: Scale,     cls: 'text-amber-700 bg-amber-100' },
}

const statusConfig: Record<ControlStatus, { label: string; icon: React.ElementType; cls: string }> = {
  implemented:     { label: 'Implementado',     icon: CheckCircle2, cls: 'text-green-700 bg-green-100' },
  partial:         { label: 'Parcial',          icon: AlertCircle,  cls: 'text-yellow-700 bg-yellow-100' },
  planned:         { label: 'Planeado',         icon: Clock,        cls: 'text-blue-700 bg-blue-100' },
  not_implemented: { label: 'Não Implementado', icon: XCircle,      cls: 'text-red-700 bg-red-100' },
  not_applicable:  { label: 'Não Aplicável',    icon: MinusCircle,  cls: 'text-slate-500 bg-slate-100' },
}

const effectivenessConfig: Record<ControlEffectiveness, { label: string; cls: string }> = {
  effective:         { label: 'Eficaz',             cls: 'text-green-700 bg-green-50 border-green-200' },
  needs_improvement: { label: 'Precisa de Melhoria', cls: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  ineffective:       { label: 'Ineficaz',           cls: 'text-red-700 bg-red-50 border-red-200' },
  untested:          { label: 'Por Testar',         cls: 'text-slate-600 bg-slate-50 border-slate-200' },
}

// ─── Sortable header ───────────────────────────────────────────────────────
function SortTh({ label, col, sortKey, sortDir, onSort, className }: {
  label: string; col: string; sortKey: string | null; sortDir: 'asc' | 'desc'
  onSort: (col: any) => void; className?: string
}) {
  const active = sortKey === col
  const Icon = active ? (sortDir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown
  return (
    <th className={className}>
      <button onClick={() => onSort(col)}
        className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors group">
        {label}
        <Icon size={13} className={active ? 'text-blue-500' : 'text-slate-300 group-hover:text-blue-400'} />
      </button>
    </th>
  )
}

// ─── KPI Card ──────────────────────────────────────────────────────────────
function KpiCard({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <div className="flex items-end justify-between mt-1">
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-slate-400">{pct}%</p>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
        <div className={`h-full rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function Controls() {
  const qc = useQueryClient()
  const { data: controls = [], isLoading } = useQuery({ queryKey: ['controls'], queryFn: controlsApi.list })
  const { data: risks = [] } = useQuery({ queryKey: ['risks'], queryFn: risksApi.list })

  const createMutation = useMutation({ mutationFn: controlsApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['controls'] }) })
  const updateMutation = useMutation({ mutationFn: ({ id, body }: { id: string; body: Partial<Control> }) => controlsApi.update(id, body), onSuccess: () => qc.invalidateQueries({ queryKey: ['controls'] }) })
  const deleteMutation = useMutation({ mutationFn: controlsApi.remove, onSuccess: () => qc.invalidateQueries({ queryKey: ['controls'] }) })

  const [search, setSearch]               = useState('')
  const [filterCategory, setFilterCategory] = useState<ControlCategory | 'all'>('all')
  const [filterStatus, setFilterStatus]   = useState<ControlStatus | 'all'>('all')
  const [filterEff, setFilterEff]         = useState<ControlEffectiveness | 'all'>('all')
  const [sortKey, setSortKey]             = useState<'code' | 'name' | 'category' | 'status' | 'effectiveness' | null>('code')
  const [sortDir, setSortDir]             = useState<'asc' | 'desc'>('asc')
  const [modalOpen, setModalOpen]         = useState(false)
  const [editing, setEditing]             = useState<Control | null>(null)
  const [deleteTarget, setDeleteTarget]   = useState<Control | null>(null)
  const [expandedId, setExpandedId]       = useState<string | null>(null)
  const [searchParams, setSearchParams]   = useSearchParams()
  const highlightRef                      = useRef<HTMLTableRowElement | null>(null)

  // Deep-link: ?control=A.5.1 → expand and scroll to that row
  useEffect(() => {
    const targetId = searchParams.get('control')
    if (!targetId || controls.length === 0) return
    setExpandedId(targetId)
    setSearchParams({}, { replace: true })
    setTimeout(() => {
      highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 120)
  }, [searchParams, controls])

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CFormData>({
    resolver: zodResolver(controlSchema) as any,
  })

  // KPIs
  const total       = controls.length
  const implemented = controls.filter(c => c.status === 'implemented').length
  const partial     = controls.filter(c => c.status === 'partial').length
  const notImpl     = controls.filter(c => c.status === 'not_implemented').length
  const effective   = controls.filter(c => c.effectiveness === 'effective').length
  const ineffective = controls.filter(c => c.effectiveness === 'ineffective').length

  // Sort orders
  const statusOrder: Record<string, number> = { implemented: 4, partial: 3, planned: 2, not_implemented: 1, not_applicable: 0 }
  const effOrder: Record<string, number>    = { effective: 4, needs_improvement: 3, untested: 2, ineffective: 1 }

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    const base = controls.filter(c => {
      const q = search.toLowerCase()
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || (c.owner || '').toLowerCase().includes(q)
      const matchCat    = filterCategory === 'all' || c.category === filterCategory
      const matchStat   = filterStatus   === 'all' || c.status === filterStatus
      const matchEff    = filterEff      === 'all' || c.effectiveness === filterEff
      return matchSearch && matchCat && matchStat && matchEff
    })
    if (!sortKey) return base
    return [...base].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'code')          cmp = a.code.localeCompare(b.code, 'pt', { numeric: true })
      if (sortKey === 'name')          cmp = a.name.localeCompare(b.name)
      if (sortKey === 'category')      cmp = a.category.localeCompare(b.category)
      if (sortKey === 'status')        cmp = (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0)
      if (sortKey === 'effectiveness') cmp = (effOrder[a.effectiveness] ?? 0) - (effOrder[b.effectiveness] ?? 0)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [controls, search, filterCategory, filterStatus, filterEff, sortKey, sortDir])

  function openCreate() {
    setEditing(null)
    reset({ code: '', name: '', description: '', category: 'Organizacional', framework_refs: '', status: 'not_implemented', effectiveness: 'untested', owner: '', risk_ids: '', notes: '' })
    setModalOpen(true)
  }

  function openEdit(c: Control) {
    setEditing(c)
    reset({
      code: c.code, name: c.name, description: c.description || '',
      category: c.category, framework_refs: c.frameworkRefs || '',
      status: c.status, effectiveness: c.effectiveness,
      owner: c.owner || '', risk_ids: c.riskIds || '', notes: c.notes || '',
    })
    setModalOpen(true)
  }

  function onSubmit(data: CFormData) {
    if (editing) updateMutation.mutate({ id: editing.id, body: data as any })
    else createMutation.mutate(data as any)
    setModalOpen(false)
  }

  function confirmDelete() {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
    setDeleteTarget(null)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Implementados"      value={implemented} total={total} color="text-green-600" />
        <KpiCard label="Parciais"           value={partial}     total={total} color="text-yellow-600" />
        <KpiCard label="Não Implementados"  value={notImpl}     total={total} color="text-red-600" />
        <KpiCard label="Eficazes"           value={effective}   total={total} color="text-blue-600" />
      </div>

      {/* Filters + create button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar controlos..."
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white w-64" />
          </div>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value as any)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="all">Todos os temas</option>
            {Object.keys(categoryConfig).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="all">Todos os estados</option>
            {Object.entries(statusConfig).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
          </select>
          <select value={filterEff} onChange={e => setFilterEff(e.target.value as any)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="all">Toda a eficácia</option>
            {Object.entries(effectivenessConfig).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Novo Controlo
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <th className="w-8 px-2 py-3"></th>
              <SortTh label="Código"    col="code"          sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="text-left px-4 py-3 w-24" />
              <SortTh label="Nome"      col="name"          sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="text-left px-4 py-3" />
              <SortTh label="Tema"      col="category"      sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="text-left px-3 py-3 w-40" />
              <SortTh label="Estado"    col="status"        sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="text-left px-3 py-3 w-44" />
              <SortTh label="Eficácia"  col="effectiveness" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="text-left px-3 py-3 w-40" />
              <th className="text-right px-3 py-3 w-20">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-sm">Nenhum controlo encontrado</td></tr>
            )}
            {filtered.map(c => {
              const isExpanded = expandedId === c.id
              const catCfg = categoryConfig[c.category] ?? categoryConfig['Organizacional']
              const CatIcon = catCfg.icon
              const stCfg = statusConfig[c.status] ?? statusConfig.not_implemented
              const StIcon = stCfg.icon
              const effCfg = effectivenessConfig[c.effectiveness] ?? effectivenessConfig.untested
              const riskIdsArr = (c.riskIds || '').split(',').map(s => s.trim()).filter(Boolean)
              const linkedRisks = risks.filter(r => riskIdsArr.includes(r.id))

              return (
                <>
                  <tr
                    key={c.id}
                    ref={isExpanded ? (el) => { if (el) highlightRef.current = el } : undefined}
                    className={`border-t border-slate-50 hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50 ring-2 ring-inset ring-blue-200' : ''}`}
                  >
                    <td className="px-2 py-3 text-center">
                      <button onClick={() => setExpandedId(isExpanded ? null : c.id)}
                        className="text-slate-400 hover:text-blue-600 transition-colors rounded">
                        <ChevronRight size={16} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{c.code}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 truncate">{c.name}</p>
                      {c.frameworkRefs && <p className="text-xs text-slate-400 truncate max-w-xs">{c.frameworkRefs}</p>}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${catCfg.cls}`}>
                        <CatIcon size={11} />{c.category}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${stCfg.cls}`}>
                        <StIcon size={11} />{stCfg.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${effCfg.cls}`}>
                        {effCfg.label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(c)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${c.id}-detail`}>
                      <td colSpan={7} className="bg-slate-50 px-0 py-0">
                        <div className="pl-12 pr-4 py-4 border-t border-dashed border-slate-200 space-y-3">
                          <div className="flex flex-wrap gap-6">
                            {c.owner && (
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Responsável</p>
                                <p className="text-sm text-slate-700">{c.owner}</p>
                              </div>
                            )}
                            {c.frameworkRefs && (
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Frameworks</p>
                                <p className="text-sm text-slate-700">{c.frameworkRefs}</p>
                              </div>
                            )}
                          </div>
                          {c.description && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Descrição</p>
                              <p className="text-sm text-slate-700">{c.description}</p>
                            </div>
                          )}
                          {c.notes && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Notas internas</p>
                              <p className="text-sm text-slate-600 italic">{c.notes}</p>
                            </div>
                          )}
                          {linkedRisks.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Riscos cobertos</p>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-slate-400 uppercase tracking-wider font-semibold">
                                    <th className="text-left py-1 pr-4">ID</th>
                                    <th className="text-left py-1 pr-4">Nome</th>
                                    <th className="text-left py-1 pr-4">Score</th>
                                    <th className="text-left py-1 pr-4">Nível</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {linkedRisks.map(r => (
                                    <tr key={r.id} className="border-t border-slate-100">
                                      <td className="py-1.5 pr-4 font-mono text-slate-600">{r.id}</td>
                                      <td className="py-1.5 pr-4 text-slate-700">{r.name}</td>
                                      <td className="py-1.5 pr-4 font-bold text-slate-800">{r.score}</td>
                                      <td className="py-1.5 pr-4">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                          r.level === 'critical' ? 'bg-red-100 text-red-700' :
                                          r.level === 'high'     ? 'bg-orange-100 text-orange-700' :
                                          r.level === 'medium'   ? 'bg-yellow-100 text-yellow-700' :
                                                                   'bg-green-100 text-green-700'
                                        }`}>{r.level}</span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Create/Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Controlo' : 'Novo Controlo'} size="lg">
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Código</label>
              <input {...register('code')} placeholder="A.8.7" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300" />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Nome</label>
              <input {...register('name')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Descrição</label>
            <textarea {...register('description')} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Tema</label>
              <select {...register('category')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                {Object.keys(categoryConfig).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Referências</label>
              <input {...register('framework_refs')} placeholder="ISO 27001:2022 A.8.7 · NIS2 Art.21(2)(g)" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Estado</label>
              <select {...register('status')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                {Object.entries(statusConfig).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Eficácia</label>
              <select {...register('effectiveness')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                {Object.entries(effectivenessConfig).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Responsável</label>
              <input {...register('owner')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Riscos cobertos (IDs separados por vírgula)</label>
              <input {...register('risk_ids')} placeholder="R003,R011" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Notas internas</label>
            <textarea {...register('notes')} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
              {editing ? 'Guardar' : 'Criar Controlo'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Eliminar Controlo" size="sm">
        <p className="text-sm text-slate-600 mb-6">
          Tem a certeza que pretende eliminar <strong>{deleteTarget?.code} — {deleteTarget?.name}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={confirmDelete} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium">Eliminar</button>
        </div>
      </Modal>
    </div>
  )
}
