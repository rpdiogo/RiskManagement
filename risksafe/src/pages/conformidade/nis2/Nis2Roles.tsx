import { useState } from 'react'
import { ChevronDown, ChevronRight, User, Briefcase, Server, Scale, Shield, Building, Users, ShoppingCart, ArrowRight } from 'lucide-react'
import data from '../../../data/nis2-roadmap-data.json'
import type { Nis2RoadmapData, Nis2Role, Nis2RaciRow } from '../../../data/nis2-types'

const d = data as Nis2RoadmapData

const roleIcons: Record<string, React.ElementType> = {
  'ISO':                       User,
  'DPO':                       Briefcase,
  'IT Manager / Equipa IT':    Server,
  'Jurídico / Compliance':     Scale,
  'SOC / Equipa de Segurança': Shield,
  'Administração / Board':     Building,
  'RH / Formação':             Users,
  'Compras / Procurement':     ShoppingCart,
}

const roleColors: Record<string, string> = {
  'ISO':                       'text-blue-600 bg-blue-50 border-blue-200',
  'DPO':                       'text-purple-600 bg-purple-50 border-purple-200',
  'IT Manager / Equipa IT':    'text-cyan-600 bg-cyan-50 border-cyan-200',
  'Jurídico / Compliance':     'text-amber-600 bg-amber-50 border-amber-200',
  'SOC / Equipa de Segurança': 'text-red-600 bg-red-50 border-red-200',
  'Administração / Board':     'text-slate-700 bg-slate-50 border-slate-200',
  'RH / Formação':             'text-pink-600 bg-pink-50 border-pink-200',
  'Compras / Procurement':     'text-emerald-600 bg-emerald-50 border-emerald-200',
}

function RoleCard({ role }: { role: Nis2Role }) {
  const [open, setOpen] = useState(false)
  const Icon = roleIcons[role.role] ?? User
  const cls = roleColors[role.role] ?? 'text-slate-600 bg-slate-50 border-slate-200'

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden bg-white`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl border ${cls} shrink-0`}>
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">{role.role}</h3>
              {open ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{role.fullName}</p>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{role.description}</p>
          </div>
        </div>
        {/* Meta strip */}
      </button>

      {open && (
        <div className="px-5 pb-4 border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Principais Responsabilidades</p>
          <ul className="space-y-1.5">
            {role.responsibilities.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                <ArrowRight size={12} className="text-blue-500 mt-0.5 shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── RACI ────────────────────────────────────────────────────────────────────

const raciColors: Record<string, string> = {
  'R':   'bg-blue-100 text-blue-700',
  'A':   'bg-red-100 text-red-700',
  'A/R': 'bg-purple-100 text-purple-700',
  'C':   'bg-amber-50 text-amber-700',
  'I':   'bg-slate-100 text-slate-500',
}

function RaciCell({ value }: { value: string | null }) {
  if (!value) return <span className="text-slate-300 text-xs">–</span>
  const v = value.trim().toUpperCase()
  const cls = raciColors[v] ?? 'bg-slate-100 text-slate-500'
  return (
    <span className={`inline-flex items-center justify-center w-9 h-6 rounded text-[10px] font-bold ${cls}`}>
      {v}
    </span>
  )
}

function RaciMatrix({ rows }: { rows: Nis2RaciRow[] }) {
  const roleKeys: (keyof Nis2RaciRow)[] = ['ISO', 'Jurídico', 'DPO', 'IT', 'SOC', 'RH', 'Compras', 'Admin']
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-sm">Matriz RACI — Atividades-Chave</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          <span className="font-semibold text-blue-700">R</span> Responsible (executa) ·
          <span className="font-semibold text-red-700 ml-2">A</span> Accountable (responde) ·
          <span className="font-semibold text-amber-700 ml-2">C</span> Consulted ·
          <span className="font-semibold text-slate-500 ml-2">I</span> Informed
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50">
            <tr className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <th className="text-left px-5 py-2 sticky left-0 bg-slate-50 z-10">Atividade</th>
              {roleKeys.map(k => <th key={k} className="text-center px-2 py-2">{k}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-5 py-2 text-slate-700 font-medium sticky left-0 bg-white hover:bg-slate-50/70 z-10">{r.activity}</td>
                {roleKeys.map(k => (
                  <td key={k} className="text-center px-2 py-2">
                    <RaciCell value={(r as any)[k] as string | null} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Nis2Roles() {
  return (
    <div className="space-y-5">
      {/* Summary banner */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs font-medium text-slate-500">Papéis Definidos</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{d.roles.length}</p>
          <p className="text-xs text-slate-400 mt-1">ISO, DPO, IT, Jurídico, SOC, Board, RH, Compras</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs font-medium text-slate-500">Atividades RACI</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{d.raci.length}</p>
          <p className="text-xs text-slate-400 mt-1">atividades-chave NIS2 mapeadas</p>
        </div>
      </div>

      {/* Roles cards */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Papéis & Responsabilidades</h2>
        <div className="grid grid-cols-2 gap-3">
          {d.roles.map(r => <RoleCard key={r.role} role={r} />)}
        </div>
      </div>

      {/* RACI matrix */}
      <RaciMatrix rows={d.raci} />
    </div>
  )
}
