import { Construction } from 'lucide-react'

export default function Placeholder({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-96 gap-4 text-slate-400">
      <Construction size={48} strokeWidth={1} />
      <p className="text-lg font-medium">Página em desenvolvimento</p>
      <p className="text-sm">{name} será implementado em breve</p>
    </div>
  )
}
