import { useState } from 'react'
import { Plus, Pencil, Trash2, CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Modal from '../components/ui/Modal'
import { actionPlansApi } from '../api/risks'
import { risksApi } from '../api/risks'
import type { ActionPlan } from '../types'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  risk_id:  z.string().min(1, 'Risco obrigatório'),
  title:    z.string().min(3, 'Título obrigatório'),
  owner:    z.string().min(2, 'Responsável obrigatório'),
  due_date: z.string().min(1, 'Prazo obrigatório'),
  status:   z.enum(['not_started', 'in_progress', 'completed', 'delayed']),
})
type FormData = z.infer<typeof schema>

const statusConfig: Record<ActionPlan['status'], { label: string; icon: React.ElementType; color: string }> = {
  not_started: { label: 'Não Iniciado', icon: Circle,       color: 'text-slate-500 bg-slate-100' },
  in_progress: { label: 'Em Curso',     icon: Clock,        color: 'text-blue-600 bg-blue-100' },
  completed:   { label: 'Concluído',    icon: CheckCircle2, color: 'text-green-600 bg-green-100' },
  delayed:     { label: 'Atrasado',     icon: AlertCircle,  color: 'text-red-600 bg-red-100' },
}

export default function ActionPlans() {
  const qc = useQueryClient()
  const { data: plans = [], isLoading } = useQuery({ queryKey: ['action-plans'], queryFn: () => actionPlansApi.list() })
  const { data: risks = [] } = useQuery({ queryKey: ['risks'], queryFn: risksApi.list })

  const createMutation = useMutation({
    mutationFn: actionPlansApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['action-plans'] }),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<ActionPlan> }) => actionPlansApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['action-plans'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: actionPlansApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['action-plans'] }),
  })

  const [filterStatus, setFilterStatus] = useState<ActionPlan['status'] | 'all'>('all')
  const [modalOpen, setModalOpen]       = useState(false)
  const [editing, setEditing]           = useState<ActionPlan | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ActionPlan | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  })

  const filtered = plans.filter(p => filterStatus === 'all' || p.status === filterStatus)

  const riskName = (id: string) => risks.find(r => r.id === id)?.name ?? id

  function openCreate() {
    setEditing(null)
    reset({ risk_id: risks[0]?.id ?? '', title: '', owner: '', due_date: '', status: 'not_started' } as any)
    setModalOpen(true)
  }

  function openEdit(p: ActionPlan) {
    setEditing(p)
    reset({ risk_id: p.riskId, title: p.title, owner: p.owner, due_date: p.dueDate, status: p.status as any })
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

  // Stats
  const total       = plans.length
  const completed   = plans.filter(p => p.status === 'completed').length
  const inProgress  = plans.filter(p => p.status === 'in_progress').length
  const notStarted  = plans.filter(p => p.status === 'not_started').length
  const delayed     = plans.filter(p => p.status === 'delayed').length
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0

  if (isLoading) return <div className="flex items-center justify-center h-96"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total',         value: total,      status: 'all',         base: 'bg-slate-50 border-slate-200',   active: 'bg-slate-200 border-slate-400 ring-2 ring-slate-400' },
          { label: 'Concluídos',    value: completed,  status: 'completed',   base: 'bg-green-50 border-green-200',   active: 'bg-green-100 border-green-500 ring-2 ring-green-400' },
          { label: 'Em Curso',      value: inProgress, status: 'in_progress', base: 'bg-blue-50 border-blue-200',     active: 'bg-blue-100 border-blue-500 ring-2 ring-blue-400' },
          { label: 'Não Iniciados', value: notStarted, status: 'not_started', base: 'bg-slate-50 border-slate-200',   active: 'bg-slate-200 border-slate-400 ring-2 ring-slate-400' },
          { label: 'Atrasados',     value: delayed,    status: 'delayed',     base: 'bg-red-50 border-red-200',       active: 'bg-red-100 border-red-500 ring-2 ring-red-400' },
        ].map(({ label, value, status, base, active }) => {
          const isActive = filterStatus === status
          return (
            <button
              key={label}
              onClick={() => setFilterStatus(isActive && status !== 'all' ? 'all' : status as any)}
              className={`rounded-xl border p-4 text-left w-full transition-all cursor-pointer hover:shadow-md ${isActive ? active : base + ' hover:brightness-95'}`}
            >
              <p className="text-xs text-slate-500 font-medium">{label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
            </button>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Conclusão Global</span>
          <span className="text-sm font-bold text-slate-800">{completionPct}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
        </div>
      </div>

      {/* Filter + Add */}
      <div className="flex items-center justify-between">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
          <option value="all">Todos os estados</option>
          {Object.entries(statusConfig).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
        </select>

        <button onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Nova Ação
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <th className="text-left px-4 py-3">Ação</th>
              <th className="text-left px-4 py-3">Risco Associado</th>
              <th className="text-left px-4 py-3">Responsável</th>
              <th className="text-left px-4 py-3">Prazo</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-right px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400 text-sm">Nenhuma ação encontrada</td></tr>
            )}
            {filtered.map(p => {
              const { label, icon: Icon, color } = statusConfig[p.status] ?? statusConfig.not_started
              return (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-medium text-slate-800 truncate">{p.title}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs max-w-[180px] truncate">{riskName(p.riskId)}</td>
                  <td className="px-4 py-3 text-slate-600">{p.owner}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{p.dueDate}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
                      <Icon size={11} />{label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={15} /></button>
                      <button onClick={() => setDeleteTarget(p)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Ação' : 'Nova Ação'} size="md">
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Risco Associado</label>
            <select {...register('risk_id')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
              {risks.map(r => <option key={r.id} value={r.id}>{r.id} — {r.name}</option>)}
            </select>
            {errors.risk_id && <p className="text-xs text-red-500 mt-1">{errors.risk_id.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Título da Ação</label>
            <input {...register('title')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Responsável</label>
              <input {...register('owner')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              {errors.owner && <p className="text-xs text-red-500 mt-1">{errors.owner.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Prazo</label>
              <input type="date" {...register('due_date')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              {errors.due_date && <p className="text-xs text-red-500 mt-1">{errors.due_date.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Estado</label>
            <select {...register('status')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
              {Object.entries(statusConfig).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">{editing ? 'Guardar' : 'Criar Ação'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Eliminar Ação" size="sm">
        <p className="text-sm text-slate-600 mb-6">
          Tem a certeza que pretende eliminar <strong>{deleteTarget?.title}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancelar</button>
          <button onClick={() => { deleteMutation.mutate(deleteTarget!.id); setDeleteTarget(null) }}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Eliminar</button>
        </div>
      </Modal>
    </div>
  )
}
