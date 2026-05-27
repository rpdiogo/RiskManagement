import { useState } from 'react'
import { ShieldCheck, Calendar, Users, Scale } from 'lucide-react'
import Nis2Controls from './nis2/Nis2Controls'
import Nis2Roadmap from './nis2/Nis2Roadmap'
import Nis2Roles from './nis2/Nis2Roles'
import Nis2Obligations from './nis2/Nis2Obligations'

type Tab = 'controls' | 'roadmap' | 'roles' | 'obligations'

const tabs: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'controls',    label: 'Controlos',           icon: ShieldCheck, desc: 'Estado dos controlos por artigo' },
  { id: 'roadmap',     label: 'Roadmap',             icon: Calendar,    desc: 'Plano de implementação 2026' },
  { id: 'roles',       label: 'Papéis & RACI',       icon: Users,       desc: 'Responsáveis e matriz RACI' },
  { id: 'obligations', label: 'Obrigações Legais',   icon: Scale,       desc: 'Prazos e referências legais' },
]

export default function Nis2() {
  const [tab, setTab] = useState<Tab>('controls')

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Conformidade NIS2</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Diretiva (UE) 2022/2555 · RJC DL 125/2025 · Regulamento CNCS
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-1" aria-label="Tabs">
          {tabs.map(t => {
            const Icon = t.icon
            const active = t.id === tab
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  active
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
                title={t.desc}
              >
                <Icon size={15} />
                {t.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab content */}
      {tab === 'controls'    && <Nis2Controls />}
      {tab === 'roadmap'     && <Nis2Roadmap />}
      {tab === 'roles'       && <Nis2Roles />}
      {tab === 'obligations' && <Nis2Obligations />}
    </div>
  )
}
