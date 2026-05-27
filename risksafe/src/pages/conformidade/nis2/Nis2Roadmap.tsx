import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronRight, Calendar, Flag, Plus, X, Check, CheckCircle2, AlertCircle, Pencil } from 'lucide-react'
import data from '../../../data/nis2-roadmap-data.json'
import type { Nis2RoadmapData, Nis2RoadmapTask } from '../../../data/nis2-types'

const d = data as Nis2RoadmapData

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const STORAGE_KEY = 'nis2-roadmap-overrides-v2'

// Timeline começa em Mai 2026 (mês 1). O mês 1 do JSON passa a representar Mai 2026.
// Sem offset: as posições mantêm-se, só o significado das labels muda.
const TASK_OFFSET = 0
// Início do calendário: Mai 2026 (ano=2026, mês=4 em 0-based)
const TIMELINE_START_YEAR = 2026
const TIMELINE_START_MONTH = 4 // Maio (0-based)

// Mês atual calculado dinamicamente a partir da data de hoje
function computeCurrentMonth(): number {
  const now = new Date()
  const months = (now.getFullYear() - TIMELINE_START_YEAR) * 12 + (now.getMonth() - TIMELINE_START_MONTH) + 1
  return Math.max(1, months)
}
const CURRENT_MONTH = computeCurrentMonth()

// Converte índice de mês do display (1=Mai 2026) em label legível
function monthLabel(m: number): string {
  return `${MONTHS[(m + 3) % 12]} ${2026 + Math.floor((m + 3) / 12)}`
}

// ─── Overrides (localStorage) ──────────────────────────────────────────────

interface TaskOverride {
  startMonth?: number
  durationMonths?: number
  completed?: boolean
}
type OverridesMap = Record<string, TaskOverride>

function taskKey(t: Nis2RoadmapTask, idx: number) {
  // phase index + position within phase = unique enough; use task name fallback
  return `${t.phase}::${idx}::${t.task.slice(0, 40)}`
}

function useOverrides() {
  const [overrides, setOverrides] = useState<OverridesMap>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  }, [overrides])

  const update = (key: string, patch: TaskOverride) =>
    setOverrides(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }))

  const reset = (key: string) =>
    setOverrides(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })

  const resetAll = () => setOverrides({})

  return { overrides, update, reset, resetAll }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function phaseIdx(phase: string) {
  const m = phase.match(/^(\d+)/)
  return m ? parseInt(m[1], 10) : 0
}

function effective(t: Nis2RoadmapTask, o?: TaskOverride) {
  return {
    // Overrides já estão em coords do display; JSON precisa do offset
    startMonth:     o?.startMonth !== undefined ? o.startMonth : t.startMonth + TASK_OFFSET,
    durationMonths: o?.durationMonths ?? (t.durationMonths || 1),
    completed:      o?.completed      ?? false,
  }
}

// status determines color
type TaskStatus = 'completed' | 'overdue' | 'in_progress' | 'upcoming'
function taskStatus(start: number, dur: number, completed: boolean): TaskStatus {
  if (completed) return 'completed'
  const end = start + dur - 1
  if (end < CURRENT_MONTH)   return 'overdue'
  if (start > CURRENT_MONTH) return 'upcoming'
  return 'in_progress'
}

const statusStyle: Record<TaskStatus, { bar: string; barText: string; dotLabel: string }> = {
  completed:   { bar: 'bg-emerald-500',  barText: 'text-white', dotLabel: 'Concluída' },
  overdue:     { bar: 'bg-red-500',      barText: 'text-white', dotLabel: 'Atrasada' },
  in_progress: { bar: 'bg-slate-500',    barText: 'text-white', dotLabel: 'Em curso' },
  upcoming:    { bar: 'bg-slate-300',    barText: 'text-slate-700', dotLabel: 'A iniciar' },
}

const priorityBorderColor: Record<string, string> = {
  'Alta':  'border-red-500',
  'Média': 'border-amber-500',
  'Baixa': 'border-blue-500',
}

// ─── Edit popover ───────────────────────────────────────────────────────────

function EditPopover({ task, override, onUpdate, onReset, onClose, totalMonths }: {
  task: Nis2RoadmapTask
  override: TaskOverride | undefined
  onUpdate: (patch: TaskOverride) => void
  onReset: () => void
  onClose: () => void
  totalMonths: number
}) {
  const eff = effective(task, override)
  const popRef = useRef<HTMLDivElement>(null)

  // close on outside click / escape
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) onClose()
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [onClose])

  return (
    <div ref={popRef} className="absolute right-0 top-full mt-1 z-30 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800 leading-snug">{task.task}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{task.owner}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 shrink-0">
          <X size={14} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mês de início</label>
            <select
              value={eff.startMonth}
              onChange={e => onUpdate({ startMonth: parseInt(e.target.value, 10) })}
              className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {Array.from({ length: totalMonths }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{monthLabel(m)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Duração (meses)</label>
            <input
              type="number"
              min={1}
              max={totalMonths}
              value={eff.durationMonths}
              onChange={e => onUpdate({ durationMonths: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors">
          <input
            type="checkbox"
            checked={eff.completed}
            onChange={e => onUpdate({ completed: e.target.checked })}
            className="w-4 h-4 accent-emerald-600 cursor-pointer"
          />
          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 size={13} /> Marcar como concluída
          </span>
        </label>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <button
            onClick={onReset}
            className="text-[10px] text-slate-500 hover:text-red-600 transition-colors"
          >
            Repor valores originais
          </button>
          <button
            onClick={onClose}
            className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1"
          >
            <Check size={12} /> Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Gantt row ──────────────────────────────────────────────────────────────

function GanttRow({ task, idx, override, onUpdate, onReset, totalMonths }: {
  task: Nis2RoadmapTask
  idx: number
  override: TaskOverride | undefined
  onUpdate: (patch: TaskOverride) => void
  onReset: () => void
  totalMonths: number
}) {
  const [editing, setEditing] = useState(false)
  const eff = effective(task, override)
  const status = taskStatus(eff.startMonth, eff.durationMonths, eff.completed)
  const style = statusStyle[status]

  const start    = Math.max(1, eff.startMonth)
  const dur      = Math.max(1, eff.durationMonths)
  const end      = Math.min(totalMonths, start + dur - 1)
  const visible  = end >= start
  const leftPct  = ((start - 1) / totalMonths) * 100
  const widthPct = visible ? Math.max(0.5, ((end - start + 1) / totalMonths) * 100) : 0

  return (
    <div className="grid grid-cols-[18rem_1fr] gap-3 items-center py-1.5 hover:bg-slate-50 transition-colors">
      {/* Task label */}
      <div className="min-w-0 pr-2">
        <div className="flex items-start gap-2">
          {task.priority && (
            <span
              className={`w-1 self-stretch rounded-full ${priorityBorderColor[task.priority] ?? 'border-slate-300'} border-l-4 flex-shrink-0`}
              title={`Prioridade ${task.priority}`}
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-700 truncate" title={task.task}>{task.task}</p>
            <p className="text-[10px] text-slate-500 truncate">
              {task.owner}
              {task.nis2Ref && <span className="text-blue-500"> · {task.nis2Ref}</span>}
              {override && <span className="text-orange-600 ml-1">· editado</span>}
            </p>
          </div>
        </div>
      </div>
      {/* Gantt bar */}
      <div className="relative h-7 bg-slate-50 rounded">
        {/* Current month marker */}
        <div
          className="absolute top-0 bottom-0 w-px bg-blue-500/70 z-10 pointer-events-none"
          style={{ left: `${(CURRENT_MONTH / totalMonths) * 100}%` }}
          title="Mês atual"
        />
        {visible && (
          <button
            onClick={() => setEditing(o => !o)}
            className={`absolute top-0.5 bottom-0.5 ${style.bar} rounded shadow-sm flex items-center justify-between px-2 group cursor-pointer hover:brightness-110 hover:shadow-md transition-all`}
            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
            title={`${task.task} — ${style.dotLabel} (${dur}m) · Clica para editar`}
          >
            <span className={`text-[10px] font-semibold ${style.barText} truncate flex items-center gap-1`}>
              {status === 'completed' && <CheckCircle2 size={10} />}
              {status === 'overdue' && <AlertCircle size={10} />}
              {dur}m
            </span>
            <Pencil size={9} className={`${style.barText} opacity-0 group-hover:opacity-70 transition-opacity shrink-0`} />
          </button>
        )}
        {editing && (
          <EditPopover
            task={task}
            override={override}
            onUpdate={onUpdate}
            onReset={() => { onReset(); setEditing(false) }}
            onClose={() => setEditing(false)}
            totalMonths={totalMonths}
          />
        )}
      </div>
    </div>
  )
}

// ─── Phase group ─────────────────────────────────────────────────────────────

function PhaseGroup({ phase, tasks, allTasksWithIdx, overrides, updateOverride, resetOverride, totalMonths }: {
  phase: string
  tasks: { task: Nis2RoadmapTask; globalIdx: number }[]
  allTasksWithIdx: { task: Nis2RoadmapTask; globalIdx: number }[]
  overrides: OverridesMap
  updateOverride: (key: string, patch: TaskOverride) => void
  resetOverride: (key: string) => void
  totalMonths: number
}) {
  const [open, setOpen] = useState(true)

  const phaseStats = tasks.reduce((acc, { task, globalIdx }) => {
    const o = overrides[taskKey(task, globalIdx)]
    const eff = effective(task, o)
    const s = taskStatus(eff.startMonth, eff.durationMonths, eff.completed)
    acc[s] = (acc[s] ?? 0) + 1
    return acc
  }, {} as Record<TaskStatus, number>)
  const completed = phaseStats.completed ?? 0
  const overdue   = phaseStats.overdue ?? 0
  const progress = Math.round((completed / tasks.length) * 100)

  function extendPhase() {
    // +1 month duration to every task in this phase
    tasks.forEach(({ task, globalIdx }) => {
      const key = taskKey(task, globalIdx)
      const eff = effective(task, overrides[key])
      updateOverride(key, { durationMonths: eff.durationMonths + 1 })
    })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
        <button onClick={() => setOpen(o => !o)} className="flex items-center gap-3 text-left flex-1">
          {open ? <ChevronDown size={15} className="text-slate-400" /> : <ChevronRight size={15} className="text-slate-400" />}
          <span className="font-semibold text-slate-800">{phase}</span>
          <span className="text-xs text-slate-400">{tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}</span>
          <span className="flex items-center gap-1.5">
            {completed > 0 && (
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <CheckCircle2 size={10} />{completed} concluídas
              </span>
            )}
            {overdue > 0 && (
              <span className="text-[10px] font-semibold bg-red-50 text-red-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <AlertCircle size={10} />{overdue} atrasadas
              </span>
            )}
          </span>
        </button>
        <div className="flex items-center gap-3">
          {/* Phase progress bar */}
          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden" title={`${progress}% concluído`}>
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-bold w-10 text-right text-emerald-600">{progress}%</span>
          {/* Add month button */}
          <button
            onClick={extendPhase}
            className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors flex items-center gap-1 font-medium"
            title="Adicionar +1 mês de duração a todas as tarefas desta fase"
          >
            <Plus size={11} /> 1 mês
          </button>
        </div>
      </div>

      {open && (
        <div className="px-5 pb-3">
          {/* Month header */}
          <div className="grid grid-cols-[18rem_1fr] gap-3 items-center pb-2 border-b border-slate-100 mb-1">
            <div />
            <div className="grid text-[10px] text-slate-400 font-semibold uppercase tracking-wider" style={{ gridTemplateColumns: `repeat(${totalMonths}, 1fr)` }}>
              {Array.from({ length: totalMonths }, (_, i) => {
                const m = i + 1
                const isCurrent = m === CURRENT_MONTH
                return (
                  <div
                    key={m}
                    className={`text-center border-r border-slate-100 last:border-0 ${isCurrent ? 'text-blue-600 font-bold' : ''}`}
                  >
                    {monthLabel(m)}
                  </div>
                )
              })}
            </div>
          </div>
          {tasks.map(({ task, globalIdx }) => {
            const key = taskKey(task, globalIdx)
            return (
              <GanttRow
                key={key}
                task={task}
                idx={globalIdx}
                override={overrides[key]}
                onUpdate={patch => updateOverride(key, patch)}
                onReset={() => resetOverride(key)}
                totalMonths={totalMonths}
              />
            )
          })}
        </div>
      )}
      {/* allTasksWithIdx kept in signature for parent re-rendering consistency */}
      <span className="hidden">{allTasksWithIdx.length}</span>
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function Nis2Roadmap() {
  const { overrides, update, reset, resetAll } = useOverrides()

  // Attach a stable global index to each task for stable keys
  const tasksWithIdx = d.roadmap.map((task, globalIdx) => ({ task, globalIdx }))

  // Compute timeline length: max of 12 OR longest task end
  const maxEnd = tasksWithIdx.reduce((max, { task, globalIdx }) => {
    const o = overrides[taskKey(task, globalIdx)]
    const eff = effective(task, o)
    return Math.max(max, eff.startMonth + eff.durationMonths - 1)
  }, 8)
  const totalMonths = Math.max(8, maxEnd)

  // Stats across all tasks
  const stats = tasksWithIdx.reduce((acc, { task, globalIdx }) => {
    const o = overrides[taskKey(task, globalIdx)]
    const eff = effective(task, o)
    const s = taskStatus(eff.startMonth, eff.durationMonths, eff.completed)
    acc[s] = (acc[s] ?? 0) + 1
    return acc
  }, {} as Record<TaskStatus, number>)

  const total      = tasksWithIdx.length
  const completed  = stats.completed   ?? 0
  const overdue    = stats.overdue     ?? 0
  const inProgress = stats.in_progress ?? 0
  const upcoming   = stats.upcoming    ?? 0
  const high = d.roadmap.filter(t => t.priority === 'Alta').length

  const phases = Array.from(new Set(d.roadmap.map(t => t.phase))).sort((a, b) => phaseIdx(a) - phaseIdx(b))
  const editedCount = Object.keys(overrides).length

  return (
    <div className="space-y-4">
      {/* Header KPIs */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-blue-500" />
            <p className="text-xs font-medium text-slate-500">Período</p>
          </div>
          <p className="text-sm font-bold text-slate-800 mt-1">
            Mai 2026 – {monthLabel(totalMonths)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{totalMonths} meses · hoje = Mai 2026</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs font-medium text-slate-500">Concluídas</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{completed}</p>
          <p className="text-[10px] text-slate-400 mt-1">{Math.round(completed/total*100)}% de {total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs font-medium text-slate-500">Atrasadas</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{overdue}</p>
          <p className="text-[10px] text-slate-400 mt-1">passaram o prazo</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs font-medium text-slate-500">Em Curso</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{inProgress}</p>
          <p className="text-[10px] text-slate-400 mt-1">{upcoming} ainda por iniciar</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Flag size={16} className="text-red-500" />
            <p className="text-xs font-medium text-slate-500">Prior. Alta</p>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">{high}</p>
          <p className="text-[10px] text-slate-400 mt-1">{Math.round(high/total*100)}% do total</p>
        </div>
      </div>

      {/* Legend + reset */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-3 flex items-center gap-4 text-xs">
        <span className="text-slate-500 font-medium">Estado:</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500" /> Concluída</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-500" /> Em curso</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-300" /> A iniciar</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500" /> Atrasada</span>
        <span className="mx-3 h-4 w-px bg-slate-200" />
        <span className="text-slate-500 font-medium">Prioridade:</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-l-4 border-red-500" /> Alta</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-l-4 border-amber-500" /> Média</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-l-4 border-blue-500" /> Baixa</span>
        <span className="ml-auto flex items-center gap-3">
          <span className="text-slate-400">Clica numa barra para editar</span>
          {editedCount > 0 && (
            <button
              onClick={() => { if (confirm(`Repor ${editedCount} tarefa(s) editada(s) aos valores originais?`)) resetAll() }}
              className="text-xs text-orange-600 hover:text-orange-700 font-medium"
            >
              Repor {editedCount} edição{editedCount > 1 ? 'ões' : ''}
            </button>
          )}
        </span>
      </div>

      {/* Phase groups */}
      <div className="space-y-3">
        {phases.map(p => {
          const phaseTasks = tasksWithIdx.filter(({ task }) => task.phase === p)
          return (
            <PhaseGroup
              key={p}
              phase={p}
              tasks={phaseTasks}
              allTasksWithIdx={tasksWithIdx}
              overrides={overrides}
              updateOverride={update}
              resetOverride={reset}
              totalMonths={totalMonths}
            />
          )
        })}
      </div>
    </div>
  )
}
