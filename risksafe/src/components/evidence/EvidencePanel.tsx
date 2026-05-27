import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Paperclip, Upload, Download, Trash2, FileText, FileImage, File, Loader2, X } from 'lucide-react'
import { evidenceApi, type Evidence } from '../../api/evidence'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function FileIcon({ mime }: { mime: string }) {
  if (mime.startsWith('image/')) return <FileImage size={15} className="text-blue-500" />
  if (mime === 'application/pdf')  return <FileText  size={15} className="text-red-500" />
  return <File size={15} className="text-slate-400" />
}

// ─── Upload zone ──────────────────────────────────────────────────────────────

function UploadZone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        e.preventDefault()
        setDragging(false)
        const files = Array.from(e.dataTransfer.files)
        if (files.length) onFiles(files)
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed cursor-pointer transition-colors text-xs
        ${dragging
          ? 'border-blue-400 bg-blue-50 text-blue-600'
          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-400 hover:text-slate-600'
        }`}
    >
      <Upload size={14} className="shrink-0" />
      <span>Arrastar ficheiro ou clicar para seleccionar</span>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files ?? [])
          if (files.length) onFiles(files)
          e.target.value = ''
        }}
      />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  controlId: string
  controlCode: string
}

export default function EvidencePanel({ controlId, controlCode }: Props) {
  const qc = useQueryClient()
  const [uploading, setUploading] = useState<string[]>([])

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['evidence', controlId],
    queryFn: () => evidenceApi.list(controlId),
  })

  const deleteMutation = useMutation({
    mutationFn: evidenceApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['evidence', controlId] }),
  })

  async function handleFiles(selected: File[]) {
    for (const file of selected) {
      setUploading(prev => [...prev, file.name])
      try {
        await evidenceApi.upload(controlId, file)
        await qc.invalidateQueries({ queryKey: ['evidence', controlId] })
      } catch {
        // silently ignore; could show toast
      } finally {
        setUploading(prev => prev.filter(n => n !== file.name))
      }
    }
  }

  return (
    <div className="mt-2 pt-2 border-t border-slate-100 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
        <Paperclip size={12} />
        Evidências
        {files.length > 0 && (
          <span className="bg-slate-100 text-slate-500 rounded-full px-1.5 font-bold">{files.length}</span>
        )}
      </div>

      {/* File list */}
      {isLoading ? (
        <p className="text-xs text-slate-400">A carregar...</p>
      ) : files.length > 0 ? (
        <div className="space-y-1">
          {files.map((f: Evidence) => (
            <div key={f.id} className="flex items-center gap-2 text-xs bg-slate-50 rounded-lg px-2.5 py-1.5 group">
              <FileIcon mime={f.mimeType} />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-slate-700">{f.originalName}</p>
                <p className="text-slate-400">{formatBytes(f.fileSize)} · {f.uploadedAt}</p>
              </div>
              {f.notes && (
                <p className="text-slate-400 italic truncate max-w-[120px]">{f.notes}</p>
              )}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => evidenceApi.download(f.id)}
                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Descarregar"
                >
                  <Download size={13} />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(f.id)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remover"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">Sem evidências anexadas</p>
      )}

      {/* Uploading indicator */}
      {uploading.map(name => (
        <div key={name} className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-2.5 py-1.5">
          <Loader2 size={13} className="animate-spin shrink-0" />
          <span className="truncate">{name}</span>
        </div>
      ))}

      {/* Upload zone */}
      <UploadZone onFiles={handleFiles} />
    </div>
  )
}
