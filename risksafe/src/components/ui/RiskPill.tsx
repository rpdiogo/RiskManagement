import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Badge from './Badge'
import type { Risk } from '../../types'

const statusLabel: Record<string, string> = {
  open: 'Aberto', in_treatment: 'Em Tratamento', mitigated: 'Mitigado',
  accepted: 'Aceite', closed: 'Fechado', not_started: 'Não Iniciado',
}

const levelColor: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-yellow-100 text-yellow-700',
  low:      'bg-green-100 text-green-700',
}

interface Props {
  risk: Risk
  /** Show full name alongside ID (default: false — ID only) */
  showName?: boolean
}

export default function RiskPill({ risk: r, showName = false }: Props) {
  const navigate = useNavigate()
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => navigate(`/riscos?risk=${r.id}`)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className={`inline-flex items-center gap-1 text-xs font-mono font-semibold px-1.5 py-0.5 rounded cursor-pointer transition-colors
          ${levelColor[r.level] ?? 'bg-slate-100 text-slate-600'}
          hover:opacity-80`}
      >
        {r.id}
        {showName && <span className="font-sans font-normal truncate max-w-[140px]">{r.name}</span>}
      </button>

      {show && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-80 bg-slate-800 text-white rounded-xl shadow-xl p-3 text-xs pointer-events-none">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">{r.name}</p>
              <p className="text-slate-400 font-mono mt-0.5">{r.id} · {r.category}</p>
            </div>
            <Badge level={r.level} />
          </div>

          {/* Description */}
          {r.description && (
            <p className="text-slate-300 leading-relaxed mb-2 line-clamp-3">{r.description}</p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-600">
            <span className="bg-slate-700 px-2 py-0.5 rounded-full">
              Score: <strong>{r.score}</strong>
            </span>
            <span className="bg-slate-700 px-2 py-0.5 rounded-full">
              P{r.probability} × I{r.impact}
            </span>
            <span className="bg-slate-700 px-2 py-0.5 rounded-full">
              {statusLabel[r.status] ?? r.status}
            </span>
            {r.owner && (
              <span className="bg-slate-700 px-2 py-0.5 rounded-full">{r.owner}</span>
            )}
          </div>

          <p className="text-slate-500 mt-2">Clique para abrir o risco →</p>
          {/* Arrow */}
          <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  )
}
