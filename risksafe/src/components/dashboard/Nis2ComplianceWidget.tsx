import { ShieldCheck } from 'lucide-react'
import type { Nis2Compliance } from '../../types'

interface Props {
  data: Nis2Compliance
}

const statusConfig = [
  { key: 'implemented',   label: 'Implementado',     color: 'bg-emerald-500' },
  { key: 'partial',       label: 'Parcial',           color: 'bg-amber-400'  },
  { key: 'planned',       label: 'Planeado',          color: 'bg-blue-400'   },
  { key: 'notImplemented',label: 'Não Implementado',  color: 'bg-red-400'    },
  { key: 'notApplicable', label: 'N/A',               color: 'bg-slate-300'  },
] as const

function scoreColor(score: number) {
  if (score >= 75) return 'text-emerald-600'
  if (score >= 50) return 'text-amber-500'
  return 'text-red-500'
}

function ArticleBar({ article, implemented, partial, planned, notImplemented, notApplicable, total }: {
  article: string; implemented: number; partial: number; planned: number
  notImplemented: number; notApplicable: number; total: number
}) {
  const applicable = total - notApplicable
  if (applicable === 0) return null

  const score = Math.round((implemented * 100 + partial * 50 + planned * 25) / applicable)
  const segments = [
    { pct: (implemented    / total) * 100, color: 'bg-emerald-500' },
    { pct: (partial        / total) * 100, color: 'bg-amber-400'  },
    { pct: (planned        / total) * 100, color: 'bg-blue-400'   },
    { pct: (notImplemented / total) * 100, color: 'bg-red-400'    },
    { pct: (notApplicable  / total) * 100, color: 'bg-slate-200'  },
  ]

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-slate-600 w-14 shrink-0">{article}</span>
      <div className="flex-1 flex h-2 rounded-full overflow-hidden bg-slate-100">
        {segments.map((s, i) =>
          s.pct > 0 ? (
            <div key={i} className={`${s.color} h-full`} style={{ width: `${s.pct}%` }} />
          ) : null
        )}
      </div>
      <span className={`text-xs font-semibold w-8 text-right ${scoreColor(score)}`}>{score}%</span>
    </div>
  )
}

export default function Nis2ComplianceWidget({ data }: Props) {
  const { score, total, implemented, partial, planned, notImplemented, notApplicable, byArticle } = data
  const applicable = total - notApplicable

  // Progress bar width for the main score
  const progressWidth = `${score}%`

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
            <ShieldCheck size={16} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Conformidade NIS2</p>
            <p className="text-xs text-slate-400">Diretiva (UE) 2022/2555 · {total} controlos</p>
          </div>
        </div>
        <span className={`text-2xl font-bold ${scoreColor(score)}`}>{score}%</span>
      </div>

      {/* Main progress bar */}
      <div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-400' : 'bg-red-400'
            }`}
            style={{ width: progressWidth }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">{applicable} controlos aplicáveis</p>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        {statusConfig.map(cfg => {
          const count = data[cfg.key]
          if (count === 0) return null
          return (
            <span key={cfg.key} className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-700">
              <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
              {cfg.label}: <strong>{count}</strong>
            </span>
          )
        })}
      </div>

      {/* Per-article breakdown */}
      {byArticle.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-slate-50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Por Artigo</p>
          <div className="space-y-1.5">
            {byArticle.map(a => (
              <ArticleBar key={a.article} {...a} />
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t border-slate-50">
        {statusConfig.map(cfg => (
          <span key={cfg.key} className="inline-flex items-center gap-1 text-xs text-slate-500">
            <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
            {cfg.label}
          </span>
        ))}
      </div>
    </div>
  )
}
