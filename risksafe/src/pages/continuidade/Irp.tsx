import { ShieldAlert, Users, AlertCircle, CheckCircle2, FileText, Clock, BookOpen, Phone, Eye, Lock, Trash2, Wrench, RefreshCw } from 'lucide-react'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const planMeta = {
  status:        'Aprovado',
  version:       '2.4',
  owner:         'ISO + SOC Lead',
  approver:      'CISO / Administração',
  lastReview:    '05 Mar 2026',
  nextReview:    '05 Set 2026',
  lastTest:      '15 Abr 2026',
  nextTest:      '15 Out 2026',
}

const csirtTeam = [
  { role: 'IRT Manager',         person: 'ISO',                phone: '+351 21 XXX XXXX', shift: '24/7 on-call' },
  { role: 'SOC Lead',            person: 'Lead Analyst',       phone: '+351 96 XXX XXXX', shift: 'On-call' },
  { role: 'Forensics Analyst',   person: 'Analyst Sr',         phone: '+351 93 XXX XXXX', shift: 'Business hours' },
  { role: 'IT Recovery',         person: 'IT Manager',         phone: '+351 91 XXX XXXX', shift: 'On-call' },
  { role: 'Legal & Compliance',  person: 'Jurídico',           phone: '+351 21 XXX XXXX', shift: 'Business hours' },
  { role: 'DPO',                 person: 'Data Protection',    phone: '+351 92 XXX XXXX', shift: 'On-call' },
  { role: 'Communications',      person: 'CMO',                phone: '+351 91 XXX XXXX', shift: 'On-call' },
  { role: 'CNCS Liaison',        person: 'ISO (PoC)',          phone: '+351 21 XXX XXXX', shift: '24/7 obrigatório' },
]

const severityLevels = [
  { level: 'P1 — Crítico',  color: 'red',     criteria: 'Ransomware ativo · Exfiltração massiva · ICS comprometido · Indisponibilidade T1 > 1h',  escalation: 'CEO + CNCS ≤24h' },
  { level: 'P2 — Alto',     color: 'orange',  criteria: 'Comprometimento de credenciais privilegiadas · Phishing massivo · DDoS prolongado',     escalation: 'CISO + CNCS ≤72h' },
  { level: 'P3 — Médio',    color: 'amber',   criteria: 'Malware contido · Vulnerabilidade explorada localmente · Tentativa intrusão bloqueada', escalation: 'ISO + SOC' },
  { level: 'P4 — Baixo',    color: 'blue',    criteria: 'Phishing pontual · Atividade suspeita não confirmada · Falhas de configuração',         escalation: 'SOC follow-up' },
]

const playbooks = [
  { name: 'Ransomware',                category: 'Malware',   triggers: 12, lastTabletop: '15 Abr 2026', maturity: 'Mature' },
  { name: 'Phishing & Credential Theft',category: 'Social',   triggers: 47, lastTabletop: '10 Fev 2026', maturity: 'Mature' },
  { name: 'DDoS',                       category: 'Network',  triggers: 8,  lastTabletop: '20 Jan 2026', maturity: 'Mature' },
  { name: 'Data Exfiltration',          category: 'Insider',  triggers: 3,  lastTabletop: '15 Abr 2026', maturity: 'In review' },
  { name: 'Supply Chain Compromise',    category: 'Third-party',triggers: 1,lastTabletop: '08 Mai 2025', maturity: 'Draft' },
  { name: 'Account Takeover',           category: 'Identity', triggers: 22, lastTabletop: '12 Mar 2026', maturity: 'Mature' },
  { name: 'Web App Attack',             category: 'Application',triggers: 15,lastTabletop: '12 Mar 2026',maturity: 'Mature' },
  { name: 'BEC (Business Email Compromise)',category: 'Social',triggers: 5,lastTabletop: '10 Fev 2026',maturity: 'Mature' },
]

const nistPhases = [
  { phase: '1. Preparação',  icon: BookOpen,  desc: 'Treino, playbooks, ferramentas, contactos atualizados, retainers forensics',    activities: ['Tabletop semestral', 'Playbook reviews', 'Tooling SOC', 'Retainer DFIR'] },
  { phase: '2. Deteção',     icon: Eye,       desc: 'SIEM, EDR, NDR, threat intel, alertas, triagem inicial',                         activities: ['SIEM rules', 'EDR baseline', 'CTI feeds', '24/7 SOC'] },
  { phase: '3. Contenção',   icon: Lock,      desc: 'Isolar sistemas afetados, preservar evidência, conter propagação',                activities: ['Isolation playbook', 'Network segmentation', 'Credential reset', 'Snapshot pre-action'] },
  { phase: '4. Erradicação', icon: Trash2,    desc: 'Remover ameaça, fechar vetor de entrada, validar limpeza',                       activities: ['Malware removal', 'Patching', 'Reimage if needed', 'IoC sweep'] },
  { phase: '5. Recuperação', icon: Wrench,    desc: 'Restaurar operação, monitorizar, validar normalidade',                            activities: ['Restore from backup', 'Service validation', 'Enhanced monitoring (30d)', 'Stakeholder comms'] },
  { phase: '6. Lições',      icon: RefreshCw, desc: 'Post-mortem, atualizar playbooks, partilhar com CNCS/ISACs',                      activities: ['Post-mortem ≤2 semanas', 'Playbook update', 'CNCS report', 'Share IoCs (Art.29)'] },
]

const cncsNotification = [
  { window: '≤ 24 horas', label: 'Alerta Precoce',     ref: 'Art.42 RJC · Art.23.4.a NIS2', content: 'Comunicação inicial: suspeita de ato ilícito, possível impacto transfronteiriço' },
  { window: '≤ 72 horas', label: 'Notificação Completa',ref: 'Art.43 RJC · Art.23.4.b NIS2',content: 'Avaliação: severidade, impacto, IoCs, atualização do alerta' },
  { window: '≤ 1 mês',    label: 'Relatório Final',     ref: 'Art.44 RJC · Art.23.4.d NIS2', content: 'Descrição pormenorizada, causa primária, medidas, impacto transfronteiriço' },
]

const tests = [
  { date: '15 Abr 2026', type: 'Tabletop',     scenario: 'Ransomware double-extortion em produção',  duration: '4h', participants: 12, result: 'Aprovado',           findings: 3 },
  { date: '10 Fev 2026', type: 'Red Team',     scenario: 'Phishing → lateral movement → exfiltração',duration: '5 dias', participants: 8,  result: 'Aprovado c/ obs.', findings: 7 },
  { date: '12 Mar 2026', type: 'Purple Team',  scenario: 'Detect/respond a TTPs APT (MITRE ATT&CK)', duration: '3 dias', participants: 6,  result: 'Aprovado',         findings: 4 },
  { date: '20 Jan 2026', type: 'Live Drill',   scenario: 'DDoS volumétrico (>50 Gbps) ao portal',    duration: '2h', participants: 5,  result: 'Aprovado',           findings: 2 },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

const severityColor: Record<string, string> = {
  red:    'border-red-500 bg-red-50',
  orange: 'border-orange-500 bg-orange-50',
  amber:  'border-amber-500 bg-amber-50',
  blue:   'border-blue-500 bg-blue-50',
}
const severityText: Record<string, string> = {
  red:    'text-red-700',
  orange: 'text-orange-700',
  amber:  'text-amber-700',
  blue:   'text-blue-700',
}

const maturityStyle: Record<string, string> = {
  'Mature':    'bg-emerald-100 text-emerald-700',
  'In review': 'bg-amber-100 text-amber-700',
  'Draft':     'bg-slate-100 text-slate-600',
}

const resultStyle: Record<string, string> = {
  'Aprovado':         'bg-emerald-100 text-emerald-700',
  'Aprovado c/ obs.': 'bg-amber-100 text-amber-700',
  'Reprovado':        'bg-red-100 text-red-700',
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function Irp() {
  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Incident Response Plan</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Plano de Resposta a Incidentes · NIS2 Art.21.2.b + Art.23 · RJC Art.42-44 · NIST SP 800-61
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-100">
              <ShieldAlert size={20} className="text-red-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Incident Response Plan</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Plano de resposta a incidentes de cibersegurança baseado em <strong>NIST SP 800-61</strong>. Conforme <strong>NIS2 Art.21.2.b</strong>, <strong>Art.23</strong> (notificações) e <strong>RJC Art.42-44</strong>.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full whitespace-nowrap">
            <CheckCircle2 size={13} /> {planMeta.status} · v{planMeta.version}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-5 pt-4 border-t border-red-100/70">
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
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Próximo Tabletop</p>
            <p className="text-xs text-slate-700 font-semibold mt-1">{planMeta.nextTest}</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-red-500" />
            <p className="text-xs font-medium text-slate-500">Playbooks</p>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-1">{playbooks.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">
            {playbooks.filter(p => p.maturity === 'Mature').length} maduros · {playbooks.filter(p => p.maturity !== 'Mature').length} em revisão
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-500" />
            <p className="text-xs font-medium text-slate-500">CSIRT</p>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-1">{csirtTeam.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">papéis definidos · SOC 24/7</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-amber-500" />
            <p className="text-xs font-medium text-slate-500">MTTD / MTTR</p>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-1">8m / 42m</p>
          <p className="text-[10px] text-slate-400 mt-1">média YTD (P1+P2)</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-emerald-500" />
            <p className="text-xs font-medium text-slate-500">Conformidade CNCS</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-1">100%</p>
          <p className="text-[10px] text-slate-400 mt-1">prazos ≤24h/72h/1m cumpridos</p>
        </div>
      </div>

      {/* Severity matrix */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={15} className="text-slate-500" />
          <h3 className="font-bold text-slate-800 text-sm">Classificação de Severidade</h3>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {severityLevels.map(s => (
            <div key={s.level} className={`rounded-xl border-l-4 p-4 ${severityColor[s.color]}`}>
              <p className={`text-xs font-bold ${severityText[s.color]}`}>{s.level}</p>
              <p className="text-[11px] text-slate-700 mt-2 leading-relaxed">{s.criteria}</p>
              <p className="text-[10px] text-slate-500 mt-2 font-semibold">Escalação: {s.escalation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* NIST Lifecycle */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw size={15} className="text-slate-500" />
          <h3 className="font-bold text-slate-800 text-sm">Ciclo de Vida do Incidente — NIST SP 800-61</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {nistPhases.map((p, i) => {
            const Icon = p.icon
            return (
              <div key={i} className="border border-slate-100 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50">
                    <Icon size={14} className="text-blue-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">{p.phase}</p>
                </div>
                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">{p.desc}</p>
                <ul className="mt-2 space-y-0.5">
                  {p.activities.map((a, j) => (
                    <li key={j} className="text-[10px] text-slate-500 flex items-start gap-1">
                      <span className="text-blue-400">›</span> {a}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      {/* CNCS Notification timeline */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <Phone size={15} className="text-red-500" />
          <h3 className="font-bold text-slate-800 text-sm">Notificação Regulatória CNCS</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {cncsNotification.map((n, i) => {
            const colors = [
              { border: 'border-red-500',   text: 'text-red-600',   bg: 'bg-red-50' },
              { border: 'border-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
              { border: 'border-blue-500',  text: 'text-blue-600',  bg: 'bg-blue-50' },
            ][i]
            return (
              <div key={i} className={`border-l-4 ${colors.border} ${colors.bg} pl-3 py-2`}>
                <p className={`text-[10px] font-bold ${colors.text} uppercase tracking-wider`}>{n.window}</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{n.label}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.content}</p>
                <p className="text-[10px] text-slate-400 mt-2 font-mono">{n.ref}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Playbooks */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <BookOpen size={15} className="text-slate-500" />
          <h3 className="font-bold text-slate-800 text-sm">Playbooks Operacionais</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <th className="text-left px-5 py-2.5">Playbook</th>
                <th className="text-left px-3 py-2.5">Categoria</th>
                <th className="text-left px-3 py-2.5">Triggers YTD</th>
                <th className="text-left px-3 py-2.5">Último Tabletop</th>
                <th className="text-left px-3 py-2.5">Maturidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {playbooks.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-800 text-xs">{p.name}</td>
                  <td className="px-3 py-3 text-xs text-slate-600">{p.category}</td>
                  <td className="px-3 py-3 text-xs text-slate-700 font-mono">{p.triggers}</td>
                  <td className="px-3 py-3 text-xs text-slate-500 font-mono">{p.lastTabletop}</td>
                  <td className="px-3 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${maturityStyle[p.maturity]}`}>
                      {p.maturity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSIRT Team */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <Users size={15} className="text-slate-500" />
          <h3 className="font-bold text-slate-800 text-sm">Equipa CSIRT</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <th className="text-left px-5 py-2.5">Papel</th>
                <th className="text-left px-3 py-2.5">Titular</th>
                <th className="text-left px-3 py-2.5">Contacto</th>
                <th className="text-left px-3 py-2.5">Turno</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {csirtTeam.map((t, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-800 text-xs">{t.role}</td>
                  <td className="px-3 py-3 text-xs text-slate-700">{t.person}</td>
                  <td className="px-3 py-3 font-mono text-[10px] text-slate-600">{t.phone}</td>
                  <td className="px-3 py-3 text-xs text-slate-500">{t.shift}</td>
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
          <h3 className="font-bold text-slate-800 text-sm">Histórico de Exercícios</h3>
          <span className="text-xs text-slate-400 ml-auto">{tests.length} exercícios documentados</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <th className="text-left px-5 py-2.5">Data</th>
                <th className="text-left px-3 py-2.5">Tipo</th>
                <th className="text-left px-3 py-2.5">Cenário</th>
                <th className="text-left px-3 py-2.5">Duração</th>
                <th className="text-left px-3 py-2.5">Particip.</th>
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
                  <td className="px-3 py-3 text-xs text-slate-500 font-mono">{t.duration}</td>
                  <td className="px-3 py-3 text-xs text-slate-600 text-center">{t.participants}</td>
                  <td className="px-3 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${resultStyle[t.result]}`}>
                      {t.result}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-bold ${t.findings > 4 ? 'text-amber-600' : 'text-slate-600'}`}>
                      {t.findings}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 flex items-start gap-3">
        <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Próximas ações:</strong> Finalizar playbook de Supply Chain Compromise (em rascunho); rever playbook de Data Exfiltration após findings do Red Team de Fev 2026; tabletop ransomware com Conselho de Administração agendado para Out 2026.
        </p>
      </div>
    </div>
  )
}
