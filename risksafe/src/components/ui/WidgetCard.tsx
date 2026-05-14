import { MoreHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'

interface WidgetCardProps {
  title: string
  children: ReactNode
  footer?: ReactNode
  className?: string
  action?: ReactNode
}

export default function WidgetCard({ title, children, footer, className = '', action }: WidgetCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col ${className}`}>
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        {action ?? (
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <MoreHorizontal size={18} />
          </button>
        )}
      </div>
      <div className="flex-1 px-5 pb-4">{children}</div>
      {footer && (
        <div className="px-5 pb-4 border-t border-slate-50 pt-3">{footer}</div>
      )}
    </div>
  )
}
