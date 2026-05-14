import { useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { vendorsApi } from '../../api/tprm'
import type { Vendor } from '../../types'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  name:         z.string().min(2),
  category:     z.string().min(2),
  criticality:  z.enum(['critical', 'high', 'medium', 'low']),
  contact_name:  z.string().min(2),
  contact_email: z.string().email('Email inválido'),
  country:      z.string().min(2),
  status:       z.enum(['active', 'inactive', 'under_review']),
})
type FormData = z.infer<typeof schema>

const statusConfig: Record<Vendor['status'], { label: string; className: string }> = {
  active:       { label: 'Ativo',      className: 'bg-green-100 text-green-700' },
  inactive:     { label: 'Inativo',    className: 'bg-slate-100 text-slate-500' },
  under_review: { label: 'Em Revisão', className: 'bg-yellow-100 text-yellow-700' },
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-orange-400' : score >= 20 ? 'bg-yellow-400' : 'bg-green-400'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700">{score}</span>
    </div>
  )
}

export default function Vendors() {
  const qc = useQueryClient()
  const { data: vendors = [], isLoading } = useQuery({ queryKey: ['vendors'], queryFn: vendorsApi.list })

  const createMutation = useMutation({ mutationFn: vendorsApi.create,  onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }) })
  const updateMutation = useMutation({ mutationFn: ({ id, body }: { id: string; body: Partial<Vendor> }) => vendorsApi.update(id, body), onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }) })
  const deleteMutation = useMutation({ mutationFn: vendorsApi.remove,  onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }) })

  const [search, setSearch]           = useState('')
  const [modalOpen, setModalOpen]     = useState(false)
  const [editing, setEditing]         = useState<Vendor | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) as any })

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase()))

  function openCreate() {
    setEditing(null)
    reset({ name: '', category: '', criticality: 'medium', contact_name: '', contact_email: '', country: 'Portugal', status: 'active' })
    setModalOpen(true)
  }

  function openEdit(v: Vendor) {
    setEditing(v)
    reset({ name: v.name, category: v.category, criticality: v.criticality, contact_name: v.contactName, contact_email: v.contactEmail, country: v.country, status: v.status })
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

  if (isLoading) return <div className="flex items-center justify-center h-96"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar fornecedores..."
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white w-64" />
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Novo Fornecedor
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <th className="text-left px-4 py-3">Fornecedor</th>
              <th className="text-left px-4 py-3">Categoria</th>
              <th className="text-left px-4 py-3">Criticidade</th>
              <th className="text-left px-4 py-3">Score de Risco</th>
              <th className="text-left px-4 py-3">Contacto</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Fim Contrato</th>
              <th className="text-right px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {vendors.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">Nenhum fornecedor registado</td></tr>
            )}
            {filtered.map(v => (
              <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3"><p className="font-medium text-slate-800">{v.name}</p><p className="text-xs text-slate-400">{v.country}</p></td>
                <td className="px-4 py-3 text-slate-600">{v.category}</td>
                <td className="px-4 py-3"><Badge level={v.criticality} /></td>
                <td className="px-4 py-3"><ScoreBar score={v.riskScore ?? 0} /></td>
                <td className="px-4 py-3"><p className="text-slate-700">{v.contactName}</p><p className="text-xs text-slate-400">{v.contactEmail}</p></td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[v.status]?.className ?? ''}`}>
                    {statusConfig[v.status]?.label ?? v.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{v.contractEnd ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(v)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={15} /></button>
                    <button onClick={() => setDeleteTarget(v)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Fornecedor' : 'Novo Fornecedor'} size="md">
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Nome</label>
              <input {...register('name')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}</div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Categoria</label>
              <input {...register('category')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Criticidade</label>
              <select {...register('criticality')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                <option value="critical">Crítico</option><option value="high">Alto</option><option value="medium">Médio</option><option value="low">Baixo</option>
              </select></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Estado</label>
              <select {...register('status')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                <option value="active">Ativo</option><option value="inactive">Inativo</option><option value="under_review">Em Revisão</option>
              </select></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Nome do Contacto</label>
              <input {...register('contact_name')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Email do Contacto</label>
              <input {...register('contact_email')} type="email" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              {errors.contact_email && <p className="text-xs text-red-500 mt-1">{errors.contact_email.message}</p>}</div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">País</label>
              <input {...register('country')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">{editing ? 'Guardar' : 'Criar Fornecedor'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remover Fornecedor" size="sm">
        <p className="text-sm text-slate-600 mb-6">Tem a certeza que pretende remover <strong>{deleteTarget?.name}</strong>?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancelar</button>
          <button onClick={() => { deleteMutation.mutate(deleteTarget!.id); setDeleteTarget(null) }}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Remover</button>
        </div>
      </Modal>
    </div>
  )
}
