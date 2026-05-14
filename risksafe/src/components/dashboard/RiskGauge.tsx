interface RiskGaugeProps {
  score: number
}

function getLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'CRÍTICO', color: '#EF4444' }
  if (score >= 60) return { label: 'ALTO',    color: '#F97316' }
  if (score >= 40) return { label: 'MÉDIO',   color: '#EAB308' }
  return               { label: 'BAIXO',   color: '#22C55E' }
}

export default function RiskGauge({ score }: RiskGaugeProps) {
  const { label, color } = getLabel(score)
  const clamp = Math.min(Math.max(score, 0), 100)
  const angle = -90 + (clamp / 100) * 180

  const r = 60
  const cx = 80, cy = 80
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const arcX = (deg: number) => cx + r * Math.cos(toRad(deg))
  const arcY = (deg: number) => cy + r * Math.sin(toRad(deg))

  const arcPath = (from: number, to: number) => {
    const x1 = arcX(from), y1 = arcY(from)
    const x2 = arcX(to),   y2 = arcY(to)
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`
  }

  const needleXFix = cx + (r - 8) * Math.cos(toRad(angle))
  const needleYFix = cy + (r - 8) * Math.sin(toRad(angle))

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 160 90" className="w-44">
        <path d={`M ${arcX(-180)} ${arcY(-180)} A ${r} ${r} 0 0 1 ${arcX(0)} ${arcY(0)}`}
          stroke="#E2E8F0" strokeWidth="12" fill="none" strokeLinecap="round" />
        {[
          { from: -180, to: -108, color: '#22C55E' },
          { from: -108, to:  -54, color: '#EAB308' },
          { from:  -54, to:    0, color: '#EF4444' },
        ].map(({ from, to, color: c }) => (
          <path key={from} d={arcPath(from, to)} stroke={c} strokeWidth="12" fill="none" strokeLinecap="butt" />
        ))}
        <line
          x1={cx} y1={cy}
          x2={needleXFix} y2={needleYFix}
          stroke="#1E2A3B" strokeWidth="3" strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="4" fill="#1E2A3B" />
      </svg>
      <p className="text-xl font-bold mt-1" style={{ color }}>{label}</p>
      <p className="text-xs text-slate-400">Score {score} / 100</p>
    </div>
  )
}
