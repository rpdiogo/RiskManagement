import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, Server, Monitor, Wifi, Cloud, ChevronRight } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import RiskMultiSelect from '../components/ui/RiskMultiSelect'
import RiskPill from '../components/ui/RiskPill'
import { assetsApi } from '../api/assets'
import { risksApi } from '../api/risks'
import type { Asset, AssetType, AssetStatus, RiskLevel } from '../types'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  name:        z.string().min(2, 'Nome obrigatório'),
  type:        z.enum(['software', 'hardware', 'network', 'service']),
  owner:       z.string().min(2, 'Responsável obrigatório'),
  criticality: z.enum(['critical', 'high', 'medium', 'low']),
  status:      z.enum(['active', 'maintenance', 'decommissioned']),
  vendor:      z.string().optional(),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const typeConfig: Record<AssetType, { label: string; icon: React.ElementType; color: string }> = {
  software: { label: 'Software',      icon: Monitor, color: 'text-blue-600 bg-blue-100' },
  hardware: { label: 'Hardware',      icon: Server,  color: 'text-slate-600 bg-slate-100' },
  network:  { label: 'Rede',          icon: Wifi,    color: 'text-purple-600 bg-purple-100' },
  service:  { label: 'Serviço Cloud', icon: Cloud,   color: 'text-teal-600 bg-teal-100' },
}

const statusConfig: Record<AssetStatus, { label: string; color: string }> = {
  active:          { label: 'Ativo',           color: 'bg-green-100 text-green-700' },
  maintenance:     { label: 'Em Manutenção',   color: 'bg-yellow-100 text-yellow-700' },
  decommissioned:  { label: 'Desativado',      color: 'bg-slate-100 text-slate-500' },
}

export default function Assets() {
  const qc = useQueryClient()
  const { data: assets = [], isLoading } = useQuery({ queryKey: ['assets'], queryFn: assetsApi.list })
  const { data: risks = [] } = useQuery({ queryKey: ['risks'], queryFn: risksApi.list })

  const createMutation = useMutation({ mutationFn: assetsApi.create,  onSuccess: () => qc.invalidateQueries({ queryKey: ['assets'] }) })
  const updateMutation = useMutation({ mutationFn: ({ id, body }: { id: string; body: Partial<Asset> }) => assetsApi.update(id, body), onSuccess: () => qc.invalidateQueries({ queryKey: ['assets'] }) })
  const deleteMutation = useMutation({ mutationFn: assetsApi.remove,  onSuccess: () => qc.invalidateQueries({ queryKey: ['assets'] }) })

  const [search, setSearch]                   = useState('')
  const [filterType, setFilterType]           = useState<AssetType | 'all'>('all')
  const [modalOpen, setModalOpen]             = useState(false)
  const [editing, setEditing]                 = useState<Asset | null>(null)
  const [deleteTarget, setDeleteTarget]       = useState<Asset | null>(null)
  const [selectedRiskIds, setSelectedRiskIds] = useState<string[]>([])
  const [expandedId, setExpandedId]           = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  })

  const filtered = assets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
                        (a.vendor ?? '').toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || a.type === filterType
    return matchSearch && matchType
  })

  const riskName = (id: string) => risks.find(r => r.id === id)?.name ?? id

  function openCreate() {
    setEditing(null)
    setSelectedRiskIds([])
    reset({ name: '', type: 'software', owner: '', criticality: 'medium', status: 'active', vendor: '', description: '' })
    setModalOpen(true)
  }

  function openEdit(a: Asset) {
    setEditing(a)
    setSelectedRiskIds(a.riskIds ? a.riskIds.split(',').filter(Boolean) : [])
    reset({ name: a.name, type: a.type, owner: a.owner, criticality: a.criticality,
            status: a.status, vendor: a.vendor ?? '', description: a.description ?? '' })
    setModalOpen(true)
  }

  function onSubmit(data: FormData) {
    const body = { ...data, risk_ids: selectedRiskIds.join(',') }
    if (editing) updateMutation.mutate({ id: editing.id, body: body as any })
    else createMutation.mutate(body as any)
    setModalOpen(false)
  }

  // Stats
  const byStatus = {
    active:         assets.filter(a => a.status === 'active').length,
    maintenance:    assets.filter(a => a.status === 'maintenance').length,
    decommissioned: assets.filter(a => a.status === 'decommissioned').length,
  }
  const byCriticality = {
    critical: assets.filter(a => a.criticality === 'critical').length,
    high:     assets.filter(a => a.criticality === 'high').length,
  }

  if (isLoading) return <div className="flex items-center justify-center h-96"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total de Ativos',   value: assets.length,           color: 'bg-slate-50 border-slate-200' },
          { label: 'Ativos',            value: byStatus.active,         color: 'bg-green-50 border-green-200' },
          { label: 'Em Manutenção',     value: byStatus.maintenance,    color: 'bg-yellow-50 border-yellow-200' },
          { label: 'Críticos + Altos',  value: byCriticality.critical + byCriticality.high, color: 'bg-red-50 border-red-200' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl border p-4 ${color}`}>
            <p className="text-xs text-slate-500 font-medium">{label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters + Add */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar ativos..."
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white w-60" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value as any)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="all">Todos os tipos</option>
            {Object.entries(typeConfig).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Novo Ativo
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <th className="w-8 px-2 py-3"></th>
              <th className="text-left px-4 py-3">Ativo</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-left px-4 py-3">Criticidade</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Fornecedor</th>
              <th className="text-left px-4 py-3">Responsável</th>
              <th className="text-left px-4 py-3">Riscos</th>
              <th className="text-right px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-slate-400 text-sm">Nenhum ativo encontrado</td></tr>
            )}
            {filtered.map(a => {
              const { label: typeLabel, icon: TypeIcon, color: typeColor } = typeConfig[a.type] ?? typeConfig.software
              const { label: statusLabel, color: statusColor } = statusConfig[a.status] ?? statusConfig.active
              const linkedRiskIds = a.riskIds ? a.riskIds.split(',').filter(Boolean) : []
              const linkedRiskObjects = linkedRiskIds.map(id => risks.find(r => r.id === id)).filter(Boolean) as typeof risks
              const isExpanded = expandedId === a.id
              return (
                <>
                  <tr key={a.id} className={`border-t border-slate-50 hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50' : ''}`}>
                    <td className="px-2 py-3 text-center">
                      {linkedRiskIds.length > 0 && (
                        <button onClick={() => setExpandedId(isExpanded ? null : a.id)}
                          className="text-slate-400 hover:text-blue-600 transition-colors rounded">
                          <ChevronRight size={16} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{a.name}</p>
                      {a.description && <p className="text-xs text-slate-400 truncate max-w-xs">{a.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeColor}`}>
                        <TypeIcon size={11} />{typeLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3"><Badge level={a.criticality as RiskLevel} /></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>{statusLabel}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-sm">{a.vendor ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600 text-sm">{a.owner}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                          {linkedRiskIds.length === 0 && <span className="text-slate-300 text-xs">—</span>}
                          {linkedRiskObjects.map(r => (
                            <RiskPill key={r.id} risk={r} />
                          ))}
                        </div>
                      </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(a)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={15} /></button>
                        <button onClick={() => setDeleteTarget(a)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${a.id}-risks`}>
                      <td colSpan={9} className="bg-slate-50 px-0 py-0">
                        <div className="pl-12 pr-4 py-3 border-t border-dashed border-slate-200">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Riscos associados</p>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-slate-400 uppercase tracking-wider font-semibold">
                                <th className="text-left py-1 pr-4 w-16">ID</th>
                                <th className="text-left py-1 pr-4">Nome</th>
                                <th className="text-left py-1 pr-4">Nível</th>
                                <th className="text-center py-1 pr-4">Score</th>
                                <th className="text-left py-1 pr-4">Estado</th>
                                <th className="text-left py-1">Responsável</th>
                              </tr>
                            </thead>
                            <tbody>
                              {linkedRiskObjects.map(r => (
                                <tr key={r.id} className="border-t border-slate-100">
                                  <td className="py-1.5 pr-4 font-mono text-slate-500">{r.id}</td>
                                  <td className="py-1.5 pr-4 text-slate-700 font-medium max-w-xs truncate">{r.name}</td>
                                  <td className="py-1.5 pr-4"><Badge level={r.level} /></td>
                                  <td className="py-1.5 pr-4 text-center font-bold text-slate-700">{r.score}</td>
                                  <td className="py-1.5 pr-4">
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                      {{ open: 'Aberto', in_treatment: 'Em Tratamento', mitigated: 'Mitigado', accepted: 'Aceite', closed: 'Fechado', not_started: 'Não Iniciado' }[r.status] ?? r.status}
                                    </span>
                                  </td>
                                  <td className="py-1.5 text-slate-500">{r.owner}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Ativo' : 'Novo Ativo'} size="md">
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Nome</label>
              <input {...register('name')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Tipo</label>
              <select {...register('type')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                {Object.entries(typeConfig).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Criticidade</label>
              <select {...register('criticality')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                <option value="critical">Crítico</option>
                <option value="high">Alto</option>
                <option value="medium">Médio</option>
                <option value="low">Baixo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Estado</label>
              <select {...register('status')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                {Object.entries(statusConfig).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Fornecedor</label>
              <input {...register('vendor')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Responsável</label>
              <input {...register('owner')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              {errors.owner && <p className="text-xs text-red-500 mt-1">{errors.owner.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Riscos associados</label>
              <RiskMultiSelect risks={risks} selected={selectedRiskIds} onChange={setSelectedRiskIds} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Descrição</label>
              <textarea {...register('description')} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">{editing ? 'Guardar' : 'Criar Ativo'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remover Ativo" size="sm">
        <p className="text-sm text-slate-600 mb-6">
          Tem a certeza que pretende remover <strong>{deleteTarget?.name}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancelar</button>
          <button onClick={() => { deleteMutation.mutate(deleteTarget!.id); setDeleteTarget(null) }}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Remover</button>
        </div>
      </Modal>
    </div>
  )
}
