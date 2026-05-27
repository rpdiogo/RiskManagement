import { Server, Database, HardDrive, Cloud, CheckCircle2, Clock, Calendar, AlertCircle, MapPin, Zap } from 'lucide-react'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const planMeta = {
  status:        'Aprovado',
  version:       '3.0',
  owner:         'IT Manager + ISO',
  approver:      'CIO',
  lastReview:    '10 Fev 2026',
  nextReview:    '10 Fev 2027',
  lastTest:      '12 Mar 2026',
  nextTest:      '12 Set 2026',
}

const sites = [
  { type: 'Primário', location: 'Datacenter Lisboa (Tier III+)', mode: 'Produção 24/7', distance: '–',         status: 'Operacional' },
  { type: 'DR',       location: 'Datacenter Porto (Tier III)',   mode: 'Warm site',     distance: '320 km',    status: 'Sync ativo' },
  { type: 'Backup',   location: 'AWS S3 (eu-west-1)',            mode: 'Cold storage',  distance: 'Cloud',     status: 'Versionado' },
]

const systems = [
  { name: 'ERP (SAP S/4HANA)',         tier: 'Tier 1', rto: '2h',  rpo: '15min', replication: 'Sync',  lastFailover: '12 Mar 2026' },
  { name: 'CRM (Salesforce)',          tier: 'Tier 1', rto: '4h',  rpo: '1h',    replication: 'Sync',  lastFailover: '12 Mar 2026' },
  { name: 'E-commerce / Portal',       tier: 'Tier 1', rto: '1h',  rpo: '5min',  replication: 'Sync',  lastFailover: '08 Jan 2026' },
  { name: 'Email & Colaboração (M365)',tier: 'Tier 2', rto: '4h',  rpo: '1h',    replication: 'Cloud', lastFailover: 'N/A (SaaS)' },
  { name: 'Active Directory / IAM',    tier: 'Tier 1', rto: '1h',  rpo: '15min', replication: 'Sync',  lastFailover: '12 Mar 2026' },
  { name: 'Sistemas Financeiros',      tier: 'Tier 1', rto: '2h',  rpo: '15min', replication: 'Sync',  lastFailover: '12 Mar 2026' },
  { name: 'Aplicações de RH',          tier: 'Tier 2', rto: '8h',  rpo: '4h',    replication: 'Async', lastFailover: '15 Nov 2025' },
  { name: 'Data Warehouse / BI',       tier: 'Tier 3', rto: '24h', rpo: '24h',   replication: 'Async', lastFailover: '15 Nov 2025' },
  { name: 'Sistemas Logística',        tier: 'Tier 1', rto: '4h',  rpo: '1h',    replication: 'Sync',  lastFailover: '12 Mar 2026' },
]

const backupStrategy = [
  { type: 'Snapshots SAN',         frequency: '15 min',    retention: '24h',   destination: 'Site Primário'  },
  { type: 'Backup incremental',    frequency: 'Diário',    retention: '14 dias',destination: 'Site DR Porto' },
  { type: 'Backup completo',       frequency: 'Semanal',   retention: '12 sem.',destination: 'AWS S3'        },
  { type: 'Snapshot anual (legal)',frequency: 'Anual',     retention: '7 anos', destination: 'AWS Glacier'   },
  { type: 'Imuável (anti-ransomware)', frequency: 'Diário',retention: '30 dias',destination: 'AWS S3 + Object Lock' },
]

const procedures = [
  { phase: '1. Deteção & Declaração', action: 'NOC deteta falha · Crisis Lead declara DR · Notifica equipa', duration: '0–15 min' },
  { phase: '2. Failover Tier 1',       action: 'Promoção secundário · DNS switch · Validação serviços',      duration: '15–60 min' },
  { phase: '3. Failover Tier 2',       action: 'Restore aplicações T2 a partir de backups',                  duration: '1–4h' },
  { phase: '4. Validação',             action: 'Smoke tests · Confirmação de integridade · Sign-off COO',    duration: '2h' },
  { phase: '5. Failback',              action: 'Sincronização inversa · Switch DNS · Validação final',       duration: '4–8h (após estabilização)' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

const tierStyle: Record<string, string> = {
  'Tier 1': 'bg-red-50 text-red-700 border-red-200',
  'Tier 2': 'bg-amber-50 text-amber-700 border-amber-200',
  'Tier 3': 'bg-blue-50 text-blue-700 border-blue-200',
}

const replicationStyle: Record<string, string> = {
  'Sync':  'bg-emerald-100 text-emerald-700',
  'Async': 'bg-blue-100 text-blue-700',
  'Cloud': 'bg-purple-100 text-purple-700',
}

const siteIcon: Record<string, React.ElementType> = {
  'Primário': Server,
  'DR':       Database,
  'Backup':   Cloud,
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function Drp() {
  const tier1 = systems.filter(s => s.tier === 'Tier 1').length
  const tier2 = systems.filter(s => s.tier === 'Tier 2').length

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Disaster Recovery Plan</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Plano de Recuperação de Desastre TI · NIS2 Art.21.2.c · ISO 27031
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100">
              <Server size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Disaster Recovery Plan</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Recuperação de infraestrutura TI e dados após desastre. Conforme <strong>NIS2 Art.21.2.c</strong> e <strong>ISO 27031</strong>.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full whitespace-nowrap">
            <CheckCircle2 size={13} /> {planMeta.status} · v{planMeta.version}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-5 pt-4 border-t border-indigo-100/70">
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
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Próximo Failover Test</p>
            <p className="text-xs text-slate-700 font-semibold mt-1">{planMeta.nextTest}</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Server size={16} className="text-indigo-500" />
            <p className="text-xs font-medium text-slate-500">Sistemas Cobertos</p>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-1">{systems.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">{tier1} Tier 1 · {tier2} Tier 2</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-emerald-500" />
            <p className="text-xs font-medium text-slate-500">RTO Médio T1</p>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-1">2,3h</p>
          <p className="text-[10px] text-slate-400 mt-1">target ≤ 4h</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2">
            <HardDrive size={16} className="text-amber-500" />
            <p className="text-xs font-medium text-slate-500">RPO Médio T1</p>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-1">25 min</p>
          <p className="text-[10px] text-slate-400 mt-1">target ≤ 1h</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-blue-500" />
            <p className="text-xs font-medium text-slate-500">Último Failover</p>
          </div>
          <p className="text-sm font-bold text-slate-800 mt-1">{planMeta.lastTest}</p>
          <p className="text-[10px] text-emerald-600 mt-1">✓ aprovado</p>
        </div>
      </div>

      {/* Sites */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={15} className="text-slate-500" />
          <h3 className="font-bold text-slate-800 text-sm">Arquitetura de Sites</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {sites.map(s => {
            const Icon = siteIcon[s.type] ?? Server
            return (
              <div key={s.type} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <Icon size={16} className="text-slate-600" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{s.type}</h4>
                </div>
                <p className="text-xs font-semibold text-slate-700 mt-3">{s.location}</p>
                <p className="text-[11px] text-slate-500 mt-1">{s.mode} · {s.distance}</p>
                <span className="inline-block text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full mt-3">
                  {s.status}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Systems Coverage */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <Server size={15} className="text-slate-500" />
          <h3 className="font-bold text-slate-800 text-sm">Sistemas — RTO/RPO & Replicação</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <th className="text-left px-5 py-2.5">Sistema</th>
                <th className="text-left px-3 py-2.5">Tier</th>
                <th className="text-left px-3 py-2.5">RTO</th>
                <th className="text-left px-3 py-2.5">RPO</th>
                <th className="text-left px-3 py-2.5">Replicação</th>
                <th className="text-left px-3 py-2.5">Último Failover</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {systems.map((s, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-800 text-xs">{s.name}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tierStyle[s.tier]}`}>
                      {s.tier}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-700">{s.rto}</td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-700">{s.rpo}</td>
                  <td className="px-3 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${replicationStyle[s.replication]}`}>
                      {s.replication}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500 font-mono">{s.lastFailover}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backup Strategy */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <HardDrive size={15} className="text-slate-500" />
          <h3 className="font-bold text-slate-800 text-sm">Estratégia de Backup (regra 3-2-1-1-0)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <th className="text-left px-5 py-2.5">Tipo</th>
                <th className="text-left px-3 py-2.5">Frequência</th>
                <th className="text-left px-3 py-2.5">Retenção</th>
                <th className="text-left px-3 py-2.5">Destino</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backupStrategy.map((b, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-800 text-xs">{b.type}</td>
                  <td className="px-3 py-3 text-xs text-slate-700">{b.frequency}</td>
                  <td className="px-3 py-3 text-xs text-slate-700">{b.retention}</td>
                  <td className="px-3 py-3 text-xs text-slate-600">{b.destination}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recovery Procedure */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={15} className="text-slate-500" />
          <h3 className="font-bold text-slate-800 text-sm">Procedimento de Recuperação — Cronologia</h3>
        </div>
        <div className="space-y-3">
          {procedures.map((p, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  {i + 1}
                </div>
                {i < procedures.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1 min-h-[24px]" />}
              </div>
              <div className="flex-1 pb-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800">{p.phase}</p>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                    {p.duration}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{p.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer warning */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 flex items-start gap-3">
        <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Próximas ações:</strong> Reduzir RTO do Data Warehouse para 12h (compliance Tier 2); testar restore from immutable backup (anti-ransomware) — agendado para Set 2026.
        </p>
      </div>
    </div>
  )
}
