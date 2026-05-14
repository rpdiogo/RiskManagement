import { useState } from 'react'
import { Plus } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import { mockRisks, mockVendors } from '../../data/mock'

export default function Assessments() {
  const [vendorFilter, setVendorFilter] = useState('all')
  const vendorRisks = mockRisks.filter(r => r.category === 'Terceiros')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <select value={vendorFilter} onChange={e => setVendorFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
          <option value="all">Todos os Fornecedores</option>
          {mockVendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Nova Avaliação
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockVendors.map(vendor => (
          <div key={vendor.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-slate-800">{vendor.name}</p>
                <p className="text-xs text-slate-400">{vendor.category} · {vendor.country}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge level={vendor.criticality} />
                <div className="text-right">
                  <p className="text-xs text-slate-400">Score de Risco</p>
                  <p className="text-lg font-bold text-slate-800">{vendor.riskScore}</p>
                </div>
              </div>
            </div>
            {vendorRisks.length > 0 ? (
              <div className="border-t border-slate-50 pt-3 space-y-2">
                {vendorRisks.slice(0, 2).map(r => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700 truncate max-w-sm">{r.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge level={r.level} />
                      <span className="font-bold text-slate-800">{r.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 border-t border-slate-50 pt-3">Sem riscos associados</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
