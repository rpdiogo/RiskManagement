import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, Grid3x3, Tags, User, Save, Loader2, Plus, X } from 'lucide-react'
import { settingsApi } from '../api/settings'
import type { AppSettings } from '../types'

type TabKey = 'organization' | 'matrix' | 'taxonomy' | 'profile'

const TABS: { key: TabKey; label: string; icon: React.ElementType; description: string }[] = [
  { key: 'organization', label: 'Organização',     icon: Building2, description: 'Identificação da empresa e frameworks aplicáveis' },
  { key: 'matrix',       label: 'Matriz de Risco', icon: Grid3x3,   description: 'Calibração da matriz, thresholds e apetência' },
  { key: 'taxonomy',     label: 'Taxonomia',       icon: Tags,      description: 'Categorias de risco e tipos de ativos' },
  { key: 'profile',      label: 'Perfil',          icon: User,      description: 'Dados do utilizador atual' },
]

export default function Settings() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabKey>('organization')
  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get })
  const [draft, setDraft] = useState<AppSettings | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    if (data && !draft) setDraft(data)
  }, [data, draft])

  const updateMutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: (newData) => {
      qc.setQueryData(['settings'], newData)
      setDraft(newData)
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2000)
    },
  })

  if (isLoading || !draft) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Loader2 className="animate-spin" size={24} />
      </div>
    )
  }

  const isDirty = JSON.stringify(draft) !== JSON.stringify(data)

  function patch<K extends keyof AppSettings>(section: K, value: Partial<AppSettings[K]>) {
    setDraft(prev => prev ? { ...prev, [section]: { ...prev[section], ...value } } : prev)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
        <p className="text-sm text-slate-500 mt-1">Personalize a sua plataforma de gestão de riscos</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar de tabs */}
        <aside className="col-span-3">
          <nav className="bg-white rounded-xl border border-slate-100 shadow-sm p-2 space-y-1">
            {TABS.map(t => {
              const Icon = t.icon
              const active = activeTab === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={18} className="mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-slate-400 leading-tight mt-0.5">{t.description}</p>
                  </div>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Conteúdo */}
        <section className="col-span-9 space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            {activeTab === 'organization' && <OrganizationTab draft={draft} patch={patch} />}
            {activeTab === 'matrix'       && <MatrixTab       draft={draft} patch={patch} />}
            {activeTab === 'taxonomy'     && <TaxonomyTab     draft={draft} patch={patch} />}
            {activeTab === 'profile'      && <ProfileTab      draft={draft} patch={patch} />}
          </div>

          {/* Barra de ações */}
          <div className="flex items-center justify-between bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-3">
            <div className="text-xs text-slate-500">
              {savedFlash
                ? <span className="text-green-600 font-medium">✓ Guardado com sucesso</span>
                : isDirty
                  ? 'Tem alterações por guardar'
                  : 'Todas as alterações guardadas'}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDraft(data ?? null)}
                disabled={!isDirty || updateMutation.isPending}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={() => updateMutation.mutate(draft)}
                disabled={!isDirty || updateMutation.isPending}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Guardar Alterações
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

// ---------- ORGANIZAÇÃO ----------

const ALL_FRAMEWORKS = [
  { id: 'ISO 27001:2022', label: 'ISO 27001:2022', desc: 'Sistema de Gestão de Segurança da Informação' },
  { id: 'NIS2',           label: 'NIS2',           desc: 'Diretiva (UE) 2022/2555 — entidades essenciais/importantes' },
  { id: 'RGPD',           label: 'RGPD',           desc: 'Regulamento (UE) 2016/679 — proteção de dados' },
  { id: 'DORA',           label: 'DORA',           desc: 'Regulamento (UE) 2022/2554 — resiliência operacional digital' },
  { id: 'ISO 22301',      label: 'ISO 22301',      desc: 'Continuidade de negócio' },
  { id: 'ISO 27005',      label: 'ISO 27005',      desc: 'Gestão de risco em segurança da informação' },
  { id: 'ISO 31000',      label: 'ISO 31000',      desc: 'Gestão de risco corporativo' },
]

function OrganizationTab({ draft, patch }: { draft: AppSettings; patch: <K extends keyof AppSettings>(s: K, v: Partial<AppSettings[K]>) => void }) {
  const o = draft.organization
  const toggleFramework = (fw: string) => {
    const next = o.frameworks.includes(fw) ? o.frameworks.filter(f => f !== fw) : [...o.frameworks, fw]
    patch('organization', { frameworks: next })
  }
  return (
    <div className="space-y-6">
      <SectionHeader title="Identificação" subtitle="Dados básicos da organização" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nome da Empresa">
          <input className={inputCls} value={o.name}   onChange={e => patch('organization', { name:   e.target.value })} />
        </Field>
        <Field label="Setor / Indústria">
          <input className={inputCls} value={o.sector} onChange={e => patch('organization', { sector: e.target.value })} />
        </Field>
        <Field label="NIF">
          <input className={inputCls} value={o.nif}    onChange={e => patch('organization', { nif:    e.target.value })} />
        </Field>
        <Field label="Logo URL" hint="URL público para o logotipo (PNG/SVG)">
          <input className={inputCls} value={o.logoUrl} placeholder="https://..." onChange={e => patch('organization', { logoUrl: e.target.value })} />
        </Field>
      </div>

      <SectionHeader title="Frameworks Aplicáveis" subtitle="Normas e regulamentos a que a organização está sujeita" />
      <div className="grid grid-cols-2 gap-2">
        {ALL_FRAMEWORKS.map(fw => {
          const active = o.frameworks.includes(fw.id)
          return (
            <button
              key={fw.id}
              onClick={() => toggleFramework(fw.id)}
              className={`text-left p-3 rounded-lg border-2 transition-all ${
                active ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-medium ${active ? 'text-blue-700' : 'text-slate-700'}`}>{fw.label}</p>
                {active && <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px]">✓</div>}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-tight">{fw.desc}</p>
            </button>
          )
        })}
      </div>

      <SectionHeader title="Classificação NIS2" subtitle="Estatuto da organização segundo a Diretiva NIS2" />
      <div className="grid grid-cols-3 gap-2">
        {[
          { v: 'essential' as const, l: 'Entidade Essencial',  c: 'red' },
          { v: 'important' as const, l: 'Entidade Importante', c: 'amber' },
          { v: 'none'      as const, l: 'Fora do Âmbito',      c: 'slate' },
        ].map(opt => {
          const active = o.nis2Classification === opt.v
          const colorMap: Record<string, string> = {
            red:   active ? 'border-red-500 bg-red-50 text-red-700'   : 'border-slate-200 hover:border-red-200',
            amber: active ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 hover:border-amber-200',
            slate: active ? 'border-slate-500 bg-slate-50 text-slate-700' : 'border-slate-200 hover:border-slate-300',
          }
          return (
            <button
              key={opt.v}
              onClick={() => patch('organization', { nis2Classification: opt.v })}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${colorMap[opt.c]}`}
            >
              {opt.l}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------- MATRIZ DE RISCO ----------

function MatrixTab({ draft, patch }: { draft: AppSettings; patch: <K extends keyof AppSettings>(s: K, v: Partial<AppSettings[K]>) => void }) {
  const m = draft.riskMatrix
  const setProbLabel   = (i: number, v: string) => patch('riskMatrix', { probabilityLabels: m.probabilityLabels.map((l, idx) => idx === i ? v : l) })
  const setImpactLabel = (i: number, v: string) => patch('riskMatrix', { impactLabels:      m.impactLabels.map((l, idx)      => idx === i ? v : l) })

  // Visualização da matriz com cores baseadas nos thresholds atuais
  const cellLevel = (score: number) => {
    if (score > m.thresholds.highMax)  return 'critical'
    if (score > m.thresholds.mediumMax) return 'high'
    if (score > m.thresholds.lowMax)    return 'medium'
    return 'low'
  }
  const levelColor: Record<string, string> = {
    critical: 'bg-red-500',
    high:     'bg-orange-400',
    medium:   'bg-yellow-300',
    low:      'bg-green-400',
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Tamanho da Matriz" subtitle="Granularidade dos níveis de Probabilidade e Impacto" />
      <div className="text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-lg p-3">
        ⚠️ Atualmente apenas <b>5×5</b> está suportado. 3×3 e 4×4 serão adicionados em iteração futura.
      </div>

      <SectionHeader title="Etiquetas de Probabilidade" subtitle="Da menor (1) à maior (5)" />
      <div className="grid grid-cols-5 gap-2">
        {m.probabilityLabels.map((label, i) => (
          <Field key={i} label={`P = ${i + 1}`}>
            <input className={inputCls} value={label} onChange={e => setProbLabel(i, e.target.value)} />
          </Field>
        ))}
      </div>

      <SectionHeader title="Etiquetas de Impacto" subtitle="Da menor (1) à maior (5)" />
      <div className="grid grid-cols-5 gap-2">
        {m.impactLabels.map((label, i) => (
          <Field key={i} label={`I = ${i + 1}`}>
            <input className={inputCls} value={label} onChange={e => setImpactLabel(i, e.target.value)} />
          </Field>
        ))}
      </div>

      <SectionHeader title="Thresholds dos Níveis de Risco" subtitle="Pontos de corte sobre o score (P × I)" />
      <div className="grid grid-cols-3 gap-4">
        <Field label="Baixo (score ≤)" hint="Acima deste valor passa a Médio">
          <input type="number" min={1} max={25} className={inputCls} value={m.thresholds.lowMax}
                 onChange={e => patch('riskMatrix', { thresholds: { ...m.thresholds, lowMax: Number(e.target.value) } })} />
        </Field>
        <Field label="Médio (score ≤)" hint="Acima deste valor passa a Alto">
          <input type="number" min={1} max={25} className={inputCls} value={m.thresholds.mediumMax}
                 onChange={e => patch('riskMatrix', { thresholds: { ...m.thresholds, mediumMax: Number(e.target.value) } })} />
        </Field>
        <Field label="Alto (score ≤)" hint="Acima deste valor é Crítico">
          <input type="number" min={1} max={25} className={inputCls} value={m.thresholds.highMax}
                 onChange={e => patch('riskMatrix', { thresholds: { ...m.thresholds, highMax: Number(e.target.value) } })} />
        </Field>
      </div>

      <SectionHeader title="Apetência e Tolerância ao Risco" subtitle="Limites institucionais (escala 1–25)" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Apetência ao Risco" hint="Nível de risco que a organização aceita prosseguir">
          <input type="number" min={1} max={25} className={inputCls} value={m.appetite}
                 onChange={e => patch('riskMatrix', { appetite: Number(e.target.value) })} />
        </Field>
        <Field label="Tolerância ao Risco" hint="Limite máximo aceitável antes de exigir tratamento imediato">
          <input type="number" min={1} max={25} className={inputCls} value={m.tolerance}
                 onChange={e => patch('riskMatrix', { tolerance: Number(e.target.value) })} />
        </Field>
      </div>

      <SectionHeader title="Pré-visualização" subtitle="Como a matriz fica com a configuração atual" />
      <div className="inline-flex flex-col gap-1">
        <div className="flex items-end gap-3 mb-1">
          <span className="text-xs font-medium text-slate-500 w-24 text-right">Probabilidade</span>
        </div>
        {[5, 4, 3, 2, 1].map(p => (
          <div key={p} className="flex items-center gap-1">
            <span className="text-xs text-slate-500 w-24 text-right pr-2 truncate" title={m.probabilityLabels[p - 1]}>
              {p}. {m.probabilityLabels[p - 1]}
            </span>
            {[1, 2, 3, 4, 5].map(i => {
              const score = p * i
              return (
                <div key={i} className={`w-12 h-10 rounded ${levelColor[cellLevel(score)]} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                  {score}
                </div>
              )
            })}
          </div>
        ))}
        <div className="flex items-center gap-1 mt-1">
          <span className="w-24"></span>
          {[1, 2, 3, 4, 5].map(i => (
            <span key={i} className="w-12 text-center text-xs text-slate-500 truncate px-1" title={m.impactLabels[i - 1]}>
              {i}. {m.impactLabels[i - 1]?.slice(0, 5)}
            </span>
          ))}
        </div>
        <span className="text-xs text-slate-500 text-center mt-1">Impacto</span>
      </div>
    </div>
  )
}

// ---------- TAXONOMIA ----------

function TaxonomyTab({ draft, patch }: { draft: AppSettings; patch: <K extends keyof AppSettings>(s: K, v: Partial<AppSettings[K]>) => void }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Categorias de Risco" subtitle="Categorias usadas para classificar riscos" />
      <ListEditor
        items={draft.taxonomy.riskCategories}
        onChange={items => patch('taxonomy', { riskCategories: items })}
        placeholder="Adicionar categoria de risco..."
      />

      <SectionHeader title="Tipos de Ativo" subtitle="Tipos de ativos no inventário" />
      <ListEditor
        items={draft.taxonomy.assetTypes}
        onChange={items => patch('taxonomy', { assetTypes: items })}
        placeholder="Adicionar tipo de ativo..."
      />

      <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
        💡 As categorias de Controlos seguem os 4 temas do <b>ISO 27001:2022 Anexo A</b> (Organizacional, Pessoas, Físico, Tecnológico) mais <b>Regulamentar</b> (para medidas NIS2 / DORA / RGPD nativas) e não são editáveis.
      </div>
    </div>
  )
}

function ListEditor({ items, onChange, placeholder }: { items: string[]; onChange: (items: string[]) => void; placeholder: string }) {
  const [newItem, setNewItem] = useState('')
  const add = () => {
    const v = newItem.trim()
    if (!v || items.includes(v)) return
    onChange([...items, v])
    setNewItem('')
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-sm text-slate-700">
            {item}
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500">
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className={inputCls + ' flex-1'}
          placeholder={placeholder}
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
        />
        <button onClick={add} disabled={!newItem.trim()} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 flex items-center gap-1 text-sm">
          <Plus size={16} /> Adicionar
        </button>
      </div>
    </div>
  )
}

// ---------- PERFIL ----------

function ProfileTab({ draft, patch }: { draft: AppSettings; patch: <K extends keyof AppSettings>(s: K, v: Partial<AppSettings[K]>) => void }) {
  const p = draft.profile
  const initials = p.name.split(' ').map(s => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U'

  return (
    <div className="space-y-6">
      <SectionHeader title="Identificação do Utilizador" subtitle="Dados que aparecem no sidebar e em notificações" />

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
          {initials}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">{p.name}</p>
          <p className="text-xs text-slate-500">{p.email} · {p.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Nome">
          <input className={inputCls} value={p.name}  onChange={e => patch('profile', { name:  e.target.value })} />
        </Field>
        <Field label="Email">
          <input type="email" className={inputCls} value={p.email} onChange={e => patch('profile', { email: e.target.value })} />
        </Field>
        <Field label="Função">
          <select className={inputCls} value={p.role} onChange={e => patch('profile', { role: e.target.value })}>
            <option value="ISO">ISO — Information Security Officer</option>
            <option value="DPO">DPO — Data Protection Officer</option>
            <option value="Risk Manager">Risk Manager</option>
            <option value="Compliance Officer">Compliance Officer</option>
            <option value="Auditor">Auditor</option>
            <option value="Admin">Administrador</option>
          </select>
        </Field>
      </div>

      <SectionHeader title="Preferências" subtitle="Personalização da interface" />
      <div className="grid grid-cols-2 gap-4 opacity-50 pointer-events-none">
        <Field label="Tema" hint="Em desenvolvimento">
          <select className={inputCls} disabled defaultValue="light">
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
          </select>
        </Field>
        <Field label="Idioma" hint="Em desenvolvimento">
          <select className={inputCls} disabled defaultValue="pt">
            <option value="pt">Português</option>
            <option value="en">English</option>
          </select>
        </Field>
      </div>

      <div className="text-xs text-slate-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
        ℹ️ Sistema de autenticação (SSO, MFA, mudança de password) será adicionado em iteração futura.
      </div>
    </div>
  )
}

// ---------- UI helpers ----------

const inputCls = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600 block mb-1">{label}</span>
      {children}
      {hint && <span className="text-xs text-slate-400 block mt-1">{hint}</span>}
    </label>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-slate-100 pb-2">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
    </div>
  )
}
