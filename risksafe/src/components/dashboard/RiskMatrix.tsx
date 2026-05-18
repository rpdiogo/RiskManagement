import WidgetCard from '../ui/WidgetCard'

interface RiskMatrixProps {
  matrix: number[][]
}

function cellColor(prob: number, impact: number, hasRisks: boolean): string {
  const score = prob * impact
  if (hasRisks) {
    if (score > 16) return 'bg-red-500 text-white'
    if (score >= 10) return 'bg-orange-400 text-white'
    if (score >= 5)  return 'bg-yellow-300 text-slate-700'
    return 'bg-green-400 text-white'
  }
  // Empty cells — faint zone tint only
  if (score > 16) return 'bg-red-100'
  if (score >= 10) return 'bg-orange-100'
  if (score >= 5)  return 'bg-yellow-50'
  return 'bg-green-50'
}

const probLabels  = ['Muito Alta', 'Alta', 'Média', 'Baixa', 'Muito Baixa']
const impactLabels = ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto']

export default function RiskMatrix({ matrix }: RiskMatrixProps) {
  return (
    <WidgetCard title="Mapa de Risco">
      <div className="flex gap-2 mt-2">
        <div className="flex flex-col justify-around pr-1">
          <span className="text-xs text-slate-400 text-right" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: 10 }}>
            Probabilidade
          </span>
        </div>
        <div className="flex-1">
          <div className="flex flex-col gap-0.5">
            {matrix.map((row, ri) => (
              <div key={ri} className="flex gap-0.5 items-center">
                <span className="text-xs text-slate-400 w-14 text-right pr-1 shrink-0">{probLabels[ri]}</span>
                {row.map((val, ci) => (
                  <div
                    key={ci}
                    className={`flex-1 h-9 flex items-center justify-center text-sm font-semibold rounded transition-colors ${cellColor(5 - ri, ci + 1, val > 0)}`}
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
        </div>
      </div>
    </WidgetCard>
  )
}
