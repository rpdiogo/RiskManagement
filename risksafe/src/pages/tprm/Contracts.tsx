import { useState } from 'react'
import { Plus, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Modal from '../../components/ui/Modal'
import { contractsApi, vendorsApi } from '../../api/tprm'
import type { Contract } from '../../types'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  vendor_id:  z.string().min(1),
  title:      z.string().min(3),
  start_date: z.string().min(1),
  end_date:   z.string().min(1),
  value:      z.coerce.number().optional(),
  auto_renew: z.boolean(),
})
type FormData = z.infer<typeof schema>

const statusConfig: Record<Contract['status'], { label: string; icon: React.ElementType; color: string }> = {
  active:        { label: 'Ativo',      icon: CheckCircle,   color: 'text-green-600 bg-green-100' },
  expiring_soon: { label: 'A Expirar',  icon: AlertTriangle, color: 'text-orange-600 bg-orange-100' },
  expired:       { label: 'Expirado',   icon: Clock,         color: 'text-red-600 bg-red-100' },
  draft:         { label: 'Rascunho',   icon: FileText,      color: 'text-slate-500 bg-slate-100' },
}

function SlaBar({ pct }: { pct: number }) {
  const color = pct >= 99 ? 'bg-green-500' : pct >= 95 ? 'bg-yellow-400' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700">{pct}%</span>
    </div>
  )
}

export default function Contracts() {
  const qc = useQueryClient()
  const { data: contracts = [], isLoading } = useQuery({ queryKey: ['contracts'], queryFn: contractsApi.list })
  const { data: vendors = [] } = useQuery({ queryKey: ['vendors'], queryFn: vendorsApi.list })

  const createMutation = useMutation({ mutationFn: contractsApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }) })
  const deleteMutation = useMutation({ mutationFn: contractsApi.remove, onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }) })

  const [modalOpen, setModalOpen] = useState(false)

  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { vendor_id: vendors[0]?.id ?? '', auto_renew: false },
  })

  function onSubmit(data: FormData) {
    createMutation.mutate(data)
    setModalOpen(false)
    reset()
  }

  if (isLoading) return <div className="flex items-center justify-center h-96"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Novo Contrato
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <th className="text-left px-4 py-3">Contrato</th>
              <th className="text-left px-4 py-3">Fornecedor</th>
              <th className="text-left px-4 py-3">Início</th>
              <th className="text-left px-4 py-3">Fim</th>
              <th className="text-left px-4 py-3">Valor Anual</th>
              <th className="text-left px-4 py-3">Cumpr. SLA</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Auto-Renovação</th>
              <th className="text-right px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {contracts.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-slate-400 text-sm">Nenhum contrato registado</td></tr>
            )}
            {contracts.map(c => {
              const cfg = statusConfig[c.status] ?? statusConfig.active
              const { label, icon: Icon, color } = cfg
              const vendorName = c.vendorName
              const sla = c.slaCompliance ?? 100
              return (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{c.title}</td>
                  <td className="px-4 py-3 text-slate-600">{vendorName}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{c.startDate}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{c.endDate}</td>
                  <td className="px-4 py-3 text-slate-700">{c.value ? `€${c.value.toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3"><SlaBar pct={sla} /></td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
                      <Icon size={11} />{label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${c.autoRenew ? 'text-green-600' : 'text-slate-400'}`}>
                      {c.autoRenew ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteMutation.mutate(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <FileText size={15} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Contrato" size="md">
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Fornecedor</label>
              <select {...register('vendor_id')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Título</label>
              <input {...register('title')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Data de Início</label>
              <input type="date" {...register('start_date')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Data de Fim</label>
              <input type="date" {...register('end_date')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Valor Anual (€)</label>
              <input type="number" {...register('value')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" /></div>
            <div className="flex items-center gap-3 pt-5">
              <input type="checkbox" id="autoRenew" {...register('auto_renew')} className="w-4 h-4 rounded" />
              <label htmlFor="autoRenew" className="text-sm text-slate-700">Auto-Renovação</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Criar Contrato</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
