import { LifeBuoy, Users, AlertCircle, Clock, CheckCircle2, FileText, Building2, Activity, Calendar, Target } from 'lucide-react'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const planMeta = {
  status:        'Aprovado',
  version:       '2.1',
  owner:         'ISO + Gestão Risco',
  approver:      'Conselho de Administração',
  lastReview:    '15 Mar 2026',
  nextReview:    '15 Mar 2027',
  lastTest:      '20 Abr 2026',
  nextTest:      '20 Out 2026',
}

const criticalProcesses = [
  { name: 'Faturação a Clientes',           tier: 'Tier 1', rto: '4h',  rpo: '1h',  owner: 'CFO / Finanças' },
  { name: 'Atendimento Cliente (SAC)',      tier: 'Tier 1', rto: '4h',  rpo: '1h',  owner: 'COO' },
  { name: 'Operações Logísticas',           tier: 'Tier 1', rto: '8h',  rpo: '4h',  owner: 'COO' },
  { name: 'Gestão RH / Folha de Pagamento', tier: 'Tier 2', rto: '24h', rpo: '8h',  owner: 'CHRO' },
  { name: 'Compras / Procurement',          tier: 'Tier 2', rto: '24h', rpo: '8h',  owner: 'CFO' },
  { name: 'Comunicação Corporativa',        tier: 'Tier 3', rto: '72h', rpo: '24h', owner: 'CMO' },
]

const strategies = [
  { strategy: 'Sites de trabalho alternativos (remote-first)', coverage: '100% staff',     status: 'Ativo' },
  { strategy: 'Acordo Mutual Aid com empresa parceira',        coverage: 'Operações T1/T2', status: 'Ativo' },
  { strategy: 'Stock de segurança de equipamentos críticos',   coverage: '30 dias',         status: 'Ativo' },
  { strategy: 'Contratos de fornecimento alternativo',         coverage: 'Top 10 fornec.',  status: 'Parcial' },
]

const team = [
  { role: 'BCP Coordinator',     person: 'ISO',                phone: '+351 21 XXX XXXX', backup: 'DPO' },
  { role: 'Crisis Lead',         person: 'CEO',                phone: '+351 96 XXX XXXX', backup: 'COO' },
  { role: 'Communications',      person: 'CMO',                phone: '+351 91 XXX XXXX', backup: 'Marketing Lead' },
  { role: 'IT Recovery',         person: 'IT Manager',         phone: '+351 93 XXX XXXX', backup: 'SOC Lead' },
  { role: 'HR & Facilities',     person: 'CHRO',               phone: '+351 92 XXX XXXX', backup: 'Facilities Mgr' },
  { role: 'Legal & Regulatory',  person: 'Jurídico',           phone: '+351 21 XXX XXXX', backup: 'DPO' },
]

const tests = [
  { date: '20 Abr 2026', type: 'Tabletop',        scenario: 'Indisponibilidade do site principal (24h)', result: 'Aprovado',     findings: 2 },
  { date: '15 Out 2025', type: 'Walkthrough',     scenario: 'Falha de fornecedor crítico de cloud',      result: 'Aprovado c/ obs.', findings: 4 },
  { date: '10 Mai 2025', type: 'Simulação Real',  scenario: 'Ativação de site alternativo (4h)',          result: 'Aprovado',     findings: 1 },
  { date: '08 Nov 2024', type: 'Tabletop',        scenario: 'Pandemia / força de trabalho reduzida',     result: 'Aprovado c/ obs.', findings: 6 },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

const tierStyle: Record<string, string> = {
  'Tier 1': 'bg-red-50 text-red-700 border-red-200',
  'Tier 2': 'bg-amber-50 text-amber-700 border-amber-200',
  'Tier 3': 'bg-blue-50 text-blue-700 border-blue-200',
}

const statusStyle: Record<string, string> = {
  'Ativo':   'bg-emerald-100 text-emerald-700',
  'Parcial': 'bg-amber-100 text-amber-700',
  'Inativo': 'bg-slate-100 text-slate-500',
}

const resultStyle: Record<string, string> = {
  'Aprovado':            'bg-emerald-100 text-emerald-700',
  'Aprovado c/ obs.':    'bg-amber-100 text-amber-700',
  'Reprovado':           'bg-red-100 text-red-700',
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function Bcp() {
  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Business Continuity Plan</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Plano de Continuidade de Negócio · NIS2 Art.21.2.c · ISO 22301
          </p>
        </div>
      </div>

      {/* Header / Status banner */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100">
              <LifeBuoy size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Business Continuity Plan</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Garante a continuidade dos processos de negócio críticos face a interrupções. Conforme <strong>NIS2 Art.21.2.c</strong> e <strong>ISO 22301</strong>.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full whitespace-nowrap">
            <CheckCircle2 size={13} /> {planMeta.status} · v{planMeta.version}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-5 pt-4 border-t border-blue-100/70">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Owner</p>
            <p className="text-xs text-slate-700 font-semibold mt-1">{planMeta.owner}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Aprovado por</p>
            <p className="text-xs text-slate-700 font-semibold mt-1">{planMeta.approver}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Última Revisão</p>
            <p className="text-xs text-slate-700 font-semibold mt-1">{planMeta.lastReview}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Próxima Revisão</p>
            <p className="text-xs text-slate-700 font-semibold mt-1">{planMeta.nextReview}</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-blue-500" />
            <p className="text-xs font-medium text-slate-500">Processos Críticos</p>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-1">{criticalProcesses.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">
            {criticalProcesses.filter(p => p.tier === 'Tier 1').length} Tier 1 · {criticalProcesses.filter(p => p.tier === 'Tier 2').length} Tier 2
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" />
            <p className="text-xs font-medium text-slate-500">Estratégias Ativas</p>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {strategies.filter(s => s.status === 'Ativo').length}/{strategies.length}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            {strategies.filter(s => s.status === 'Parcial').length} parciais
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-amber-500" />
            <p className="text-xs font-medium text-slate-500">Último Teste</p>
          </div>
          <p className="text-sm font-bold text-slate-800 mt-1">{planMeta.lastTest}</p>
          <p className="text-[10px] text-slate-400 mt-1">tabletop · aprovado</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-500" />
            <p className="text-xs font-medium text-slate-500">Próximo Teste</p>
          </div>
          <p className="text-sm font-bold text-slate-800 mt-1">{planMeta.nextTest}</p>
          <p className="text-[10px] text-slate-400 mt-1">simulação real</p>
        </div>
      </div>

      {/* Critical Processes / BIA */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <Building2 size={15} className="text-slate-500" />
          <h3 className="font-bold text-slate-800 text-sm">Business Impact Analysis (BIA) — Processos Críticos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <th className="text-left px-5 py-2.5">Processo</th>
                <th className="text-left px-3 py-2.5">Criticidade</th>
                <th className="text-left px-3 py-2.5">RTO</th>
                <th className="text-left px-3 py-2.5">RPO</th>
                <th className="text-left px-3 py-2.5">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {criticalProcesses.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-800 text-xs">{p.name}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tierStyle[p.tier]}`}>
                      {p.tier}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-700">{p.rto}</td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-700">{p.rpo}</td>
                  <td className="px-3 py-3 text-xs text-slate-600">{p.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategies */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <Activity size={15} className="text-slate-500" />
          <h3 className="font-bold text-slate-800 text-sm">Estratégias de Continuidade</h3>
        </div>
        <ul className="divide-y divide-slate-100">
          {strategies.map((s, i) => (
            <li key={i} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-slate-50/70">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-800">{s.strategy}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Cobertura: {s.coverage}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyle[s.status]}`}>
                {s.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Team */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <Users size={15} className="text-slate-500" />
          <h3 className="font-bold text-slate-800 text-sm">Equipa BCP & Contactos de Emergência</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <th className="text-left px-5 py-2.5">Papel</th>
                <th className="text-left px-3 py-2.5">Titular</th>
                <th className="text-left px-3 py-2.5">Contacto</th>
                <th className="text-left px-3 py-2.5">Backup</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {team.map((t, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-800 text-xs">{t.role}</td>
                  <td className="px-3 py-3 text-xs text-slate-700">{t.person}</td>
                  <td className="px-3 py-3 font-mono text-[10px] text-slate-600">{t.phone}</td>
                  <td className="px-3 py-3 text-xs text-slate-500">{t.backup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tests Log */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <FileText size={15} className="text-slate-500" />
          <h3 className="font-bold text-slate-800 text-sm">Histórico de Testes & Exercícios</h3>
          <span className="text-xs text-slate-400 ml-auto">{tests.length} exercícios documentados</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <th className="text-left px-5 py-2.5">Data</th>
                <th className="text-left px-3 py-2.5">Tipo</th>
                <th className="text-left px-3 py-2.5">Cenário</th>
                <th className="text-left px-3 py-2.5">Resultado</th>
                <th className="text-left px-3 py-2.5">Findings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tests.map((t, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3 text-xs text-slate-700 font-mono">{t.date}</td>
                  <td className="px-3 py-3">
                    <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {t.type}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-700">{t.scenario}</td>
                  <td className="px-3 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${resultStyle[t.result]}`}>
                      {t.result}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-bold ${t.findings > 3 ? 'text-amber-600' : 'text-slate-600'}`}>
                      {t.findings}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">obs.</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer warning */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 flex items-start gap-3">
        <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Próximas ações:</strong> Atualizar acordos com fornecedores alternativos (contratos vencem em Set 2026); rever cobertura de stock de equipamentos críticos após relocalização do armazém central.
        </p>
      </div>
    </div>
  )
}
