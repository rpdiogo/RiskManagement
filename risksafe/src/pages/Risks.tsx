import { useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { risksApi } from '../api/risks'
import type { Risk, RiskLevel, RiskCategory, RiskStatus } from '../types'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  name:        z.string().min(3, 'Nome obrigatório'),
  description: z.string().min(5, 'Descrição obrigatória'),
  category:    z.enum(['Tecnológico', 'Pessoas', 'Processos', 'Terceiros', 'Físico', 'Organizacional', 'Legal e Regulamentar', 'Estratégico', 'ESG']),
  probability: z.coerce.number().min(1).max(5),
  impact:      z.coerce.number().min(1).max(5),
  owner:       z.string().min(2, 'Responsável obrigatório'),
  status:      z.enum(['open', 'in_treatment', 'mitigated', 'accepted', 'closed', 'not_started']),
})
type FormData = z.infer<typeof schema>

const statusLabel: Record<RiskStatus, string> = {
  open:         'Aberto',
  in_treatment: 'Em Tratamento',
  mitigated:    'Mitigado',
  accepted:     'Aceite',
  closed:       'Fechado',
  not_started:  'Não Iniciado',
}

export default function Risks() {
  const qc = useQueryClient()
  const { data: risks = [], isLoading } = useQuery({ queryKey: ['risks'], queryFn: risksApi.list })

  const createMutation = useMutation({
    mutationFn: risksApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['risks'] }),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Risk> }) => risksApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['risks'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: risksApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['risks'] }),
  })

  const [search, setSearch]           = useState('')
  const [filterLevel, setFilterLevel] = useState<RiskLevel | 'all'>('all')
  const [modalOpen, setModalOpen]     = useState(false)
  const [editing, setEditing]         = useState<Risk | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Risk | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  })

  const filtered = risks.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                        r.owner.toLowerCase().includes(search.toLowerCase())
    const matchLevel  = filterLevel === 'all' || r.level === filterLevel
    return matchSearch && matchLevel
  })

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

  function onSubmit(data: FormData) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, body: data })
    } else {
      createMutation.mutate(data)
    }
    setModalOpen(false)
  }

  function confirmDelete() {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
    setDeleteTarget(null)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
  }

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
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">Categoria</th>
              <th className="text-left px-4 py-3">Nível</th>
              <th className="text-center px-4 py-3">Score</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Responsável</th>
              <th className="text-right px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
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
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-sm">Nenhum risco encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

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
