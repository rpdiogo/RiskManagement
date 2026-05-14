import { Calendar, Download, Filter } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const titles: Record<string, { title: string; subtitle: string }> = {
  '/':                   { title: 'Gestão de Riscos', subtitle: 'Segurança da Informação' },
  '/riscos':             { title: 'Riscos', subtitle: 'Registo de riscos' },
  '/ativos':             { title: 'Ativos', subtitle: 'Inventário de ativos' },
  '/ameacas':            { title: 'Ameaças', subtitle: 'Catálogo de ameaças' },
  '/vulnerabilidades':   { title: 'Vulnerabilidades', subtitle: 'Gestão de vulnerabilidades' },
  '/controles':          { title: 'Controles', subtitle: 'Biblioteca de controlos' },
  '/incidentes':         { title: 'Incidentes', subtitle: 'Registo de incidentes' },
  '/planos':             { title: 'Planos de Ação', subtitle: 'Planos de tratamento' },
  '/relatorios':         { title: 'Relatórios', subtitle: 'Exportação e análise' },
  '/dashboard-exec':     { title: 'Dashboard Executivo', subtitle: 'Vista de gestão de topo' },
  '/tprm/fornecedores':  { title: 'Fornecedores', subtitle: 'Registo de terceiros' },
  '/tprm/avaliacoes':    { title: 'Avaliações de Risco', subtitle: 'Avaliações de fornecedores' },
  '/tprm/questionarios': { title: 'Questionários', subtitle: 'Questionários de segurança' },
  '/tprm/contratos':     { title: 'Contratos & SLA', subtitle: 'Contratos e cumprimento' },
  '/configuracoes':      { title: 'Configurações', subtitle: 'Definições da plataforma' },
}

export default function TopBar() {
  const { pathname } = useLocation()
  const info = titles[pathname] ?? { title: pathname.split('/').pop() ?? 'RiskSafe', subtitle: '' }

  return (
    <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-slate-800">{info.title}</h1>
        {info.subtitle && <p className="text-xs text-slate-400">{info.subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 text-sm text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors">
          <Calendar size={15} />
          <span>01/05/2024 – 31/05/2024</span>
        </button>
        <button className="flex items-center gap-2 text-sm text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors">
          <Download size={15} />
          <span>Exportar</span>
        </button>
        <button className="flex items-center gap-2 text-sm text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors">
          <Filter size={15} />
        </button>
      </div>
    </header>
  )
}
