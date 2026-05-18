import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'
import type { Risk } from '../../types'

interface Props {
  risks: Risk[]
  selected: string[]           // array of risk IDs
  onChange: (ids: string[]) => void
}

export default function RiskMultiSelect({ risks, selected, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id])
  }

  function remove(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    onChange(selected.filter(s => s !== id))
  }

  const selectedRisks = risks.filter(r => selected.includes(r.id))

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen(o => !o)}
        className="min-h-[38px] w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white cursor-pointer flex items-center flex-wrap gap-1.5 focus-within:ring-2 focus-within:ring-blue-300"
      >
        {selectedRisks.length === 0 && (
          <span className="text-slate-400 text-sm">Selecionar riscos…</span>
        )}
        {selectedRisks.map(r => (
          <span key={r.id} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
            <span className="font-mono">{r.id}</span>
            <button type="button" onClick={e => remove(r.id, e)} className="hover:text-blue-900">
              <X size={10} />
            </button>
          </span>
        ))}
        <ChevronDown size={14} className={`ml-auto text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {risks.length === 0 && (
            <p className="px-3 py-2 text-xs text-slate-400">Sem riscos disponíveis</p>
          )}
          {risks.map(r => (
            <label key={r.id}
              className="flex items-start gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={selected.includes(r.id)}
                onChange={() => toggle(r.id)}
                className="mt-0.5 shrink-0"
              />
              <span>
                <span className="font-mono text-xs text-slate-500 mr-1.5">{r.id}</span>
                <span className="text-slate-700">{r.name}</span>
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
