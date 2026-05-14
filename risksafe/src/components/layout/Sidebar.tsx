import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, AlertTriangle, Server, Zap, Bug, Shield,
  Flame, ClipboardList, BarChart3, PieChart, Settings,
  Building2, ClipboardCheck, FileQuestion, FileText, ChevronDown,
  ShieldCheck
} from 'lucide-react'
import { useState } from 'react'

const mainNav = [
  { to: '/',                icon: LayoutDashboard, label: 'Visão Geral' },
  { to: '/riscos',          icon: AlertTriangle,   label: 'Riscos' },
  { to: '/ativos',          icon: Server,          label: 'Ativos' },
  { to: '/ameacas',         icon: Zap,             label: 'Ameaças' },
  { to: '/vulnerabilidades',icon: Bug,             label: 'Vulnerabilidades' },
  { to: '/controles',       icon: Shield,          label: 'Controles' },
  { to: '/incidentes',      icon: Flame,           label: 'Incidentes' },
  { to: '/planos',          icon: ClipboardList,   label: 'Planos de Ação' },
  { to: '/relatorios',      icon: BarChart3,       label: 'Relatórios' },
  { to: '/dashboard-exec',  icon: PieChart,        label: 'Dashboard Exec.' },
]

const tprmNav = [
  { to: '/tprm/fornecedores',   icon: Building2,       label: 'Fornecedores' },
  { to: '/tprm/avaliacoes',     icon: ClipboardCheck,  label: 'Avaliações' },
  { to: '/tprm/questionarios',  icon: FileQuestion,    label: 'Questionários' },
  { to: '/tprm/contratos',      icon: FileText,        label: 'Contratos & SLA' },
]

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-sidebar-active text-white font-medium'
            : 'text-slate-300 hover:bg-sidebar-hover hover:text-white'
        }`
      }
    >
      <Icon size={17} />
      <span>{label}</span>
    </NavLink>
  )
}

export default function Sidebar() {
  const [tprmOpen, setTprmOpen] = useState(true)

  return (
    <aside className="w-60 min-h-screen bg-sidebar flex flex-col shrink-0">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <ShieldCheck size={18} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">RiskSafe</p>
          <p className="text-slate-400 text-xs">Gestão de Riscos</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 pb-2">
          Gestão de Riscos
        </p>
        {mainNav.map(item => <NavItem key={item.to} {...item} />)}

        <div className="pt-4">
          <button
            onClick={() => setTprmOpen(o => !o)}
            className="w-full flex items-center justify-between px-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors"
          >
            <span>Terceiros (TPRM)</span>
            <ChevronDown size={14} className={`transition-transform ${tprmOpen ? '' : '-rotate-90'}`} />
          </button>
          {tprmOpen && tprmNav.map(item => <NavItem key={item.to} {...item} />)}
        </div>
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <NavItem to="/configuracoes" icon={Settings} label="Configurações" />
        <div className="flex items-center gap-3 px-3 py-2 mt-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            AD
          </div>
          <div>
            <p className="text-white text-xs font-medium">Admin</p>
            <p className="text-slate-400 text-xs">CISO</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
