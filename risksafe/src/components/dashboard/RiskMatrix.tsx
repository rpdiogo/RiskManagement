import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { X, AlertTriangle, ArrowRight } from 'lucide-react'
import WidgetCard from '../ui/WidgetCard'
import type { Risk, RiskLevel } from '../../types'

interface RiskMatrixProps {
  matrix: number[][]
  residualMatrix?: number[][]
  risks?: Risk[]
}

function cellColor(prob: number, impact: number): string {
  const score = prob * impact
  if (score > 16) return 'bg-red-500 text-white'
  if (score >= 10) return 'bg-orange-400 text-white'
  if (score >= 5)  return 'bg-yellow-300 text-slate-700'
  return 'bg-green-200 text-slate-700'
}

function cellColorHover(prob: number, impact: number): string {
  const score = prob * impact
  if (score > 16) return 'hover:bg-red-600'
  if (score >= 10) return 'hover:bg-orange-500'
  if (score >= 5)  return 'hover:bg-yellow-400'
  return 'hover:bg-green-300'
}

const levelConfig: Record<RiskLevel, { cls: string; label: string }> = {
  critical: { cls: 'bg-red-100 text-red-700',    label: 'Crítico'  },
  high:     { cls: 'bg-orange-100 text-orange-700', label: 'Alto'  },
  medium:   { cls: 'bg-yellow-100 text-yellow-700', label: 'Médio' },
  low:      { cls: 'bg-green-100 text-green-700',   label: 'Baixo' },
}

const probLabels   = ['Muito Alta', 'Alta', 'Média', 'Baixa', 'Muito Baixa']
const impactLabels = ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto']

interface PopupState {
  prob: number
  impact: number
  risks: Risk[]
  x: number
  y: number
}

export default function RiskMatrix({ matrix, residualMatrix, risks = [] }: RiskMatrixProps) {
  const [view, setView] = useState<'inherent' | 'residual'>('inherent')
  const [popup, setPopup] = useState<PopupState | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const hasResidual = !!residualMatrix && residualMatrix.some(row => row.some(v => v > 0))
  const active = (view === 'residual' && hasResidual) ? residualMatrix! : matrix

  // Close popup on outside click
  useEffect(() => {
    if (!popup) return
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopup(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [popup])

  // Close on Escape
  useEffect(() => {
    if (!popup) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setPopup(null) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [popup])

  function handleCellClick(ri: number, ci: number, val: number, e: React.MouseEvent<HTMLDivElement>) {
    if (val === 0) return
    const prob   = 5 - ri   // 1–5
    const impact = ci + 1   // 1–5

    const cellRisks = risks.filter(r => {
      if (view === 'residual') {
        return r.residualProbability === prob && r.residualImpact === impact
      }
      return r.probability === prob && r.impact === impact
    })

    if (cellRisks.length === 0) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    // Position below the cell, centred on it, clamped to viewport
    const popupW = 320
    let x = rect.left + rect.width / 2 - popupW / 2
    x = Math.max(8, Math.min(x, window.innerWidth - popupW - 8))
    const y = rect.bottom + 8

    setPopup({ prob, impact, risks: cellRisks, x, y })
  }

  const toggle = hasResidual ? (
    <div className="flex rounded-md border border-slate-200 overflow-hidden text-xs font-medium">
      <button
        onClick={() => setView('inherent')}
        className={`px-2.5 py-1 transition-colors ${view === 'inherent' ? 'bg-slate-700 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
      >Inerente</button>
      <button
        onClick={() => setView('residual')}
        className={`px-2.5 py-1 transition-colors ${view === 'residual' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
      >Residual</button>
    </div>
  ) : undefined

  return (
    <WidgetCard title="Mapa de Risco" action={toggle}>
      <div className="flex gap-2 mt-2">
        <div className="flex flex-col justify-around pr-1">
          <span className="text-xs text-slate-400 text-right" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: 10 }}>
            Probabilidade
          </span>
        </div>
        <div className="flex-1">
          <div className="flex flex-col gap-0.5">
            {active.map((row, ri) => (
              <div key={ri} className="flex gap-0.5 items-center">
                <span className="text-xs text-slate-400 w-14 text-right pr-1 shrink-0">{probLabels[ri]}</span>
                {row.map((val, ci) => (
                  <div
                    key={ci}
                    onClick={(e) => handleCellClick(ri, ci, val, e)}
                    title={val > 0 && risks.length > 0 ? `${val} risco${val > 1 ? 's' : ''} — clique para ver` : undefined}
                    className={`
                      flex-1 h-9 flex items-center justify-center text-sm font-semibold rounded
                      transition-colors
                      ${cellColor(5 - ri, ci + 1)}
                      ${val > 0 && risks.length > 0 ? `cursor-pointer ${cellColorHover(5 - ri, ci + 1)} ring-0 hover:ring-2 hover:ring-white/60 hover:ring-inset` : ''}
                    `}
                  >
                    {val > 0 ? val : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="flex gap-0.5 mt-1 pl-[60px]">
            {impactLabels.map(l => (
              <div key={l} className="flex-1 text-center text-xs text-slate-400 leading-tight">{l}</div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-1">Impacto</p>
          {risks.length > 0 && (
            <p className="text-center text-xs text-slate-300 mt-0.5">Clique numa célula para ver os riscos</p>
          )}
        </div>
      </div>

      {/* Floating popup — rendered via portal so it escapes overflow:hidden */}
      {popup && typeof document !== 'undefined' && createPortal(
        <CellPopup
          ref={popupRef}
          popup={popup}
          view={view}
          onClose={() => setPopup(null)}
          onSelectRisk={(id) => { setPopup(null); navigate(`/riscos?risk=${id}`) }}
        />,
        document.body
      )}
    </WidgetCard>
  )
}

import { forwardRef } from 'react'

const CellPopup = forwardRef<HTMLDivElement, {
  popup: PopupState
  view: 'inherent' | 'residual'
  onClose: () => void
  onSelectRisk: (id: string) => void
}>(({ popup, view, onClose, onSelectRisk }, ref) => {
  const { prob, impact, risks, x, y } = popup
  const probLabel   = probLabels[5 - prob]
  const impactLabel = impactLabels[impact - 1]
  const score = prob * impact

  const headerColor =
    score > 16 ? 'bg-red-500 text-white'   :
    score >= 10 ? 'bg-orange-400 text-white' :
    score >= 5  ? 'bg-yellow-400 text-slate-800' :
                  'bg-green-400 text-slate-800'

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', top: y, left: x, width: 320 }}
      className="z-[9999] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
    >
      {/* Header */}
      <div className={`px-4 py-2.5 flex items-center justify-between ${headerColor}`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide opacity-80">
            {view === 'residual' ? 'Residual' : 'Inerente'} · P{prob} × I{impact} = {score}
          </p>
          <p className="text-sm font-semibold">{probLabel} / {impactLabel}</p>
        </div>
        <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
          <X size={16} />
        </button>
      </div>

      {/* Risk list */}
      <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
        {risks.map(r => {
          const lvl = levelConfig[r.level] ?? levelConfig.low
          return (
            <button
              key={r.id}
              onClick={() => onSelectRisk(r.id)}
              className="w-full px-4 py-2.5 flex items-start gap-3 hover:bg-blue-50 transition-colors text-left group"
            >
              <AlertTriangle size={14} className="mt-0.5 text-slate-400 shrink-0 group-hover:text-blue-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-700">{r.name}</p>
                <p className="text-xs text-slate-400 font-mono">{r.id}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${lvl.cls}`}>{lvl.label}</span>
                <span className="text-xs font-bold text-slate-600">Score {r.score}</span>
              </div>
              <ArrowRight size={14} className="mt-0.5 text-slate-200 group-hover:text-blue-400 shrink-0 transition-colors" />
            </button>
          )
        })}
      </div>

      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
        <p className="text-xs text-slate-400">{risks.length} risco{risks.length !== 1 ? 's' : ''} nesta célula</p>
      </div>
    </div>
  )
})
CellPopup.displayName = 'CellPopup'
