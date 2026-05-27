const BASE = 'http://localhost:8000'

export interface Evidence {
  id: string
  controlId: string
  originalName: string
  fileSize: number
  mimeType: string
  uploadedAt: string
  uploadedBy: string
  notes: string
}

export const evidenceApi = {
  list: (controlId: string): Promise<Evidence[]> =>
    fetch(`${BASE}/api/evidence/control/${controlId}`).then(r => r.json()),

  upload: (controlId: string, file: File, notes = '', uploadedBy = ''): Promise<Evidence> => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('notes', notes)
    fd.append('uploaded_by', uploadedBy)
    return fetch(`${BASE}/api/evidence/control/${controlId}`, {
      method: 'POST',
      body: fd,
    }).then(r => { if (!r.ok) throw new Error('Upload failed'); return r.json() })
  },

  download: (evidenceId: string) => {
    window.open(`${BASE}/api/evidence/${evidenceId}/download`, '_blank')
  },

  remove: (evidenceId: string): Promise<void> =>
    fetch(`${BASE}/api/evidence/${evidenceId}`, { method: 'DELETE' }).then(() => undefined),
}
