import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Search, ChevronRight, CheckCircle2, Clock, AlertCircle, Circle, Server, Monitor, Wifi, Cloud, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { risksApi, actionPlansApi } from '../api/risks'
import { assetsApi } from '../api/assets'
import type { Risk, RiskLevel, RiskCategory, RiskStatus, ActionPlan, AssetType } from '../types'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const typeConfig: Record<AssetType, { label: string; icon: React.ElementType; color: string }> = {
  software: { label: 'Software',      icon: Monitor, color: 'text-blue-600 bg-blue-100' },
  hardware: { label: 'Hardware',      icon: Server,  color: 'text-slate-600 bg-slate-100' },
  network:  { label: 'Rede',          icon: Wifi,    color: 'text-purple-600 bg-purple-100' },
  service:  { label: 'Serviço Cloud', icon: Cloud,   color: 'text-teal-600 bg-teal-100' },
}

// ─── Risk form schema ────────────────────────────────────────────────────────
const riskSchema = z.object({
  name:        z.string().min(3, 'Nome obrigatório'),
  description: z.string().min(5, 'Descrição obrigatória'),
  category:    z.enum(['Tecnológico', 'Pessoas', 'Processos', 'Terceiros', 'Físico', 'Organizacional', 'Legal e Regulamentar', 'Estratégico', 'ESG']),
  probability: z.coerce.number().min(1).max(5),
  impact:      z.coerce.number().min(1).max(5),
  owner:       z.string().min(2, 'Responsável obrigatório'),
  status:      z.enum(['open', 'in_treatment', 'mitigated', 'accepted', 'closed', 'not_started']),
})
type RiskFormData = z.infer<typeof riskSchema>

// ─── Action plan form schema ─────────────────────────────────────────────────
const apSchema = z.object({
  title:    z.string().min(3, 'Título obrigatório'),
  owner:    z.string().min(2, 'Responsável obrigatório'),
  due_date: z.string().min(1, 'Prazo obrigatório'),
  status:   z.enum(['not_started', 'in_progress', 'completed', 'delayed']),
})
type APFormData = z.infer<typeof apSchema>

const statusLabel: Record<RiskStatus, string> = {
  open: 'Aberto', in_treatment: 'Em Tratamento', mitigated: 'Mitigado',
  accepted: 'Aceite', closed: 'Fechado', not_started: 'Não Iniciado',
}

const apStatusCfg: Record<ActionPlan['status'], { label: string; icon: React.ElementType; cls: string }> = {
  not_started: { label: 'Não Iniciado', icon: Circle,       cls: 'text-slate-500 bg-slate-100' },
  in_progress: { label: 'Em Curso',     icon: Clock,        cls: 'text-blue-600 bg-blue-100' },
  completed:   { label: 'Concluído',    icon: CheckCircle2, cls: 'text-green-600 bg-green-100' },
  delayed:     { label: 'Atrasado',     icon: AlertCircle,  cls: 'text-red-600 bg-red-100' },
}

// ─── Sortable column header ──────────────────────────────────────────────────
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

// ─── Inline action plans + assets panel ─────────────────────────────────────
function ActionPlansPanel({ riskId }: { riskId: string }) {
  const qc = useQueryClient()
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['action-plans', riskId],
    queryFn: () => actionPlansApi.list(riskId),
  })
  const { data: allAssets = [] } = useQuery({ queryKey: ['assets'], queryFn: assetsApi.list })
  const linkedAssets = allAssets.filter(a => a.riskIds?.split(',').filter(Boolean).includes(riskId))

  const deleteMutation = useMutation({
    mutationFn: actionPlansApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['action-plans', riskId] })
      qc.invalidateQueries({ queryKey: ['action-plans'] })
    },
  })
  const createMutation = useMutation({
    mutationFn: (data: APFormData) => actionPlansApi.create({ ...data, riskId } as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['action-plans', riskId] })
      qc.invalidateQueries({ queryKey: ['action-plans'] })
      apReset()
      setAddOpen(false)
    },
  })

  const [addOpen, setAddOpen] = useState(false)
  const { register: apReg, handleSubmit: apSubmit, reset: apReset, formState: { errors: apErrors } } = useForm<APFormData>({
    resolver: zodResolver(apSchema) as any,
    defaultValues: { status: 'not_started' },
  })

  return (
    <td colSpan={8} className="bg-slate-50 px-0 py-0">
      <div className="pl-12 pr-4 py-3 border-t border-dashed border-slate-200">
        {isLoading && <p className="text-xs text-slate-400 py-1">A carregar…</p>}

        {!isLoading && plans.length === 0 && !addOpen && (
          <p className="text-xs text-slate-400 italic py-1">Sem planos de ação associados.</p>
        )}

        {plans.length > 0 && (
          <table className="w-full text-xs mb-2">
            <thead>
              <tr className="text-slate-400 uppercase tracking-wider font-semibold">
                <th className="text-left py-1 pr-4 w-1/2">Ação</th>
                <th className="text-left py-1 pr-4">Responsável</th>
                <th className="text-left py-1 pr-4">Prazo</th>
                <th className="text-left py-1 pr-4">Estado</th>
                <th className="text-right py-1"></th>
              </tr>
            </thead>
            <tbody>
              {plans.map(p => {
                const { label, icon: Icon, cls } = apStatusCfg[p.status] ?? apStatusCfg.not_started
                return (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="py-1.5 pr-4 text-slate-700 font-medium">{p.title}</td>
                    <td className="py-1.5 pr-4 text-slate-500">{p.owner}</td>
                    <td className="py-1.5 pr-4 text-slate-400">{p.dueDate}</td>
                    <td className="py-1.5 pr-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
                        <Icon size={10} />{label}
                      </span>
                    </td>
                    <td className="py-1.5 text-right">
                      <button onClick={() => deleteMutation.mutate(p.id)}
                        className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {addOpen ? (
          <form onSubmit={apSubmit(d => createMutation.mutate(d))} className="mt-2 grid grid-cols-4 gap-2 items-end">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-0.5">Título da ação</label>
              <input {...apReg('title')} placeholder="ex. Implementar MFA"
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
              {apErrors.title && <p className="text-red-500 text-xs mt-0.5">{apErrors.title.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-0.5">Responsável</label>
              <input {...apReg('owner')}
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-0.5">Prazo</label>
              <input type="date" {...apReg('due_date')}
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-0.5">Estado</label>
              <select {...apReg('status')} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                {Object.entries(apStatusCfg).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </div>
            <div className="col-span-4 flex gap-2 justify-end">
              <button type="button" onClick={() => { setAddOpen(false); apReset() }}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-100">Cancelar</button>
              <button type="submit"
                className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Guardar</button>
            </div>
          </form>
        ) : (
          <button onClick={() => setAddOpen(true)}
            className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
            <Plus size={13} /> Nova ação
          </button>
        )}

        {/* ── Ativos associados ── */}
        {linkedAssets.length > 0 && (
          <div className="mt-4 pt-3 border-t border-dashed border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ativos expostos</p>
            <div className="flex flex-wrap gap-2">
              {linkedAssets.map(a => {
                const cfg = typeConfig[a.type] ?? typeConfig.software
                const Icon = cfg.icon
                return (
                  <span key={a.id} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                    <Icon size={11} />{a.name}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </td>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function Risks() {
  const qc = useQueryClient()
  const { data: risks = [], isLoading } = useQuery({ queryKey: ['risks'], queryFn: risksApi.list })

  const createMutation = useMutation({ mutationFn: risksApi.create,  onSuccess: () => qc.invalidateQueries({ queryKey: ['risks'] }) })
  const updateMutation = useMutation({ mutationFn: ({ id, body }: { id: string; body: Partial<Risk> }) => risksApi.update(id, body), onSuccess: () => qc.invalidateQueries({ queryKey: ['risks'] }) })
  const deleteMutation = useMutation({ mutationFn: risksApi.remove,  onSuccess: () => qc.invalidateQueries({ queryKey: ['risks'] }) })

  const [search, setSearch]               = useState('')
  const [filterLevel, setFilterLevel]     = useState<RiskLevel | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<RiskCategory | 'all'>('all')
  const [sortKey, setSortKey]             = useState<'score' | 'name' | 'category' | 'level' | 'status' | null>('score')
  const [sortDir, setSortDir]             = useState<'asc' | 'desc'>('desc')
  const [modalOpen, setModalOpen]         = useState(false)
  const [editing, setEditing]             = useState<Risk | null>(null)
  const [deleteTarget, setDeleteTarget]   = useState<Risk | null>(null)
  const [expandedId, setExpandedId]       = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RiskFormData>({
    resolver: zodResolver(riskSchema) as any,
  })

  const levelOrder: Record<RiskLevel, number> = { critical: 4, high: 3, medium: 2, low: 1 }
  const statusOrder: Record<string, number> = { open: 5, in_treatment: 4, not_started: 3, accepted: 2, mitigated: 1, closed: 0 }

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = useMemo(() => {
    const base = risks.filter(r => {
      const matchSearch   = r.name.toLowerCase().includes(search.toLowerCase()) ||
                            r.owner.toLowerCase().includes(search.toLowerCase())
      const matchLevel    = filterLevel    === 'all' || r.level    === filterLevel
      const matchCategory = filterCategory === 'all' || r.category === filterCategory
      return matchSearch && matchLevel && matchCategory
    })
    if (!sortKey) return base
    return [...base].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'score')    cmp = a.score - b.score
      if (sortKey === 'name')     cmp = a.name.localeCompare(b.name)
      if (sortKey === 'category') cmp = a.category.localeCompare(b.category)
      if (sortKey === 'level')    cmp = (levelOrder[a.level] ?? 0) - (levelOrder[b.level] ?? 0)
      if (sortKey === 'status')   cmp = (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [risks, search, filterLevel, filterCategory, sortKey, sortDir])

  function openCreate() {
    setEditing(null)
    reset({ name: '', description: '', category: 'Tecnológico', probability: 3, impact: 3, owner: '', status: 'open' } as any)
    setModalOpen(true)
  }

  function openEdit(r: Risk) {
    setEditing(r)
    reset({ name: r.name, description: r.description, category: r.category as any, probability: r.probability, impact: r.impact, owner: r.owner, status: r.status as any })
    setModalOpen(true)
  }

  function onSubmit(data: RiskFormData) {
    if (editing) updateMutation.mutate({ id: editing.id, body: data })
    else createMutation.mutate(data)
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar riscos..."
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white w-64" />
          </div>
          <select value={filterLevel} onChange={e => setFilterLevel(e.target.value as any)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="all">Todos os níveis</option>
            <option value="critical">Crítico</option>
            <option value="high">Alto</option>
            <option value="medium">Médio</option>
            <option value="low">Baixo</option>
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value as any)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="all">Todas as categorias</option>
            {[...new Set(risks.map(r => r.category))].sort().map(c =>
              <option key={c} value={c}>{c}</option>
            )}
          </select>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Novo Risco
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <th className="w-8 px-2 py-3"></th>
              <SortTh label="Nome"       col="name"     sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="text-left px-4 py-3" />
              <SortTh label="Categoria"  col="category" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="text-left px-4 py-3" />
              <SortTh label="Nível"      col="level"    sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="text-left px-4 py-3" />
              <SortTh label="Score"      col="score"    sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="text-center px-4 py-3" />
              <SortTh label="Estado"     col="status"   sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="text-left px-4 py-3" />
              <th className="text-left px-4 py-3">Responsável</th>
              <th className="text-right px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">Nenhum risco encontrado</td></tr>
            )}
            {filtered.map(r => {
              const isExpanded = expandedId === r.id
              return (
                <>
                  <tr key={r.id} className={`border-t border-slate-50 hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50' : ''}`}>
                    <td className="px-2 py-3 text-center">
                      <button onClick={() => setExpandedId(isExpanded ? null : r.id)}
                        className="text-slate-400 hover:text-blue-600 transition-colors rounded">
                        <ChevronRight size={16} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium text-slate-800 truncate">{r.name}</p>
                      <p className="text-xs text-slate-400 truncate">{r.description}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.category}</td>
                    <td className="px-4 py-3"><Badge level={r.level} /></td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">{r.score}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{statusLabel[r.status] ?? r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.owner}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(r)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${r.id}-plans`}>
                      <ActionPlansPanel riskId={r.id} />
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Risk create/edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Risco' : 'Novo Risco'} size="md">
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Nome do Risco</label>
            <input {...register('name')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Descrição</label>
            <textarea {...register('description')} rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Categoria</label>
              <select {...register('category')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                {(['Tecnológico', 'Pessoas', 'Processos', 'Terceiros', 'Físico', 'Organizacional', 'Legal e Regulamentar', 'Estratégico', 'ESG'] as RiskCategory[]).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Estado</label>
              <select {...register('status')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                {Object.entries(statusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Probabilidade (1-5)</label>
              <input type="number" min={1} max={5} {...register('probability')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Impacto (1-5)</label>
              <input type="number" min={1} max={5} {...register('impact')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Responsável</label>
              <input {...register('owner')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              {errors.owner && <p className="text-xs text-red-500 mt-1">{errors.owner.message}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
              {editing ? 'Guardar' : 'Criar Risco'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Eliminar Risco" size="sm">
        <p className="text-sm text-slate-600 mb-6">
          Tem a certeza que pretende eliminar <strong>{deleteTarget?.name}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={confirmDelete} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium">Eliminar</button>
        </div>
      </Modal>
    </div>
  )
}
