import { useState } from 'react'
import { Plus, Send, CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import { mockQuestionnaires, mockVendors } from '../../data/mock'
import type { Questionnaire } from '../../types'

const statusConfig: Record<Questionnaire['status'], { label: string; icon: React.ElementType; color: string }> = {
  draft:       { label: 'Rascunho',     icon: FileText,       color: 'text-slate-500 bg-slate-100' },
  sent:        { label: 'Enviado',      icon: Send,           color: 'text-blue-600 bg-blue-100' },
  in_progress: { label: 'Em Curso',     icon: Clock,          color: 'text-yellow-600 bg-yellow-100' },
  completed:   { label: 'Concluído',    icon: CheckCircle2,   color: 'text-green-600 bg-green-100' },
  overdue:     { label: 'Em Atraso',    icon: AlertCircle,    color: 'text-red-600 bg-red-100' },
}

export default function Questionnaires() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>(mockQuestionnaires)
  const [modalOpen, setModalOpen] = useState(false)
  const [vendorId, setVendorId] = useState(mockVendors[0].id)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')

  function sendQuestionnaire() {
    const vendor = mockVendors.find(v => v.id === vendorId)!
    setQuestionnaires(qs => [{
      id: `q${Date.now()}`, vendorId, vendorName: vendor.name, title,
      status: 'sent', sentAt: new Date().toISOString().slice(0, 10), dueDate,
    }, ...qs])
    setModalOpen(false)
    setTitle('')
    setDueDate('')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Enviar Questionário
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {questionnaires.map(q => {
          const { label, icon: Icon, color } = statusConfig[q.status]
          return (
            <div key={q.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={17} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{q.title}</p>
                  <p className="text-xs text-slate-400">{q.vendorName}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 shrink-0 text-xs text-slate-500">
                {q.sentAt && <div><p className="text-slate-400">Enviado</p><p className="font-medium text-slate-700">{q.sentAt}</p></div>}
                {q.dueDate && <div><p className="text-slate-400">Prazo</p><p className="font-medium text-slate-700">{q.dueDate}</p></div>}
                {q.score != null && <div><p className="text-slate-400">Score</p><p className="font-bold text-slate-800 text-sm">{q.score}</p></div>}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
                  <Icon size={12} />{label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Enviar Questionário" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Fornecedor</label>
            <select value={vendorId} onChange={e => setVendorId(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
              {mockVendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Título</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="ex. Avaliação de Segurança 2024"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Prazo de Resposta</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancelar</button>
            <button onClick={sendQuestionnaire} disabled={!title || !dueDate}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
              Enviar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
