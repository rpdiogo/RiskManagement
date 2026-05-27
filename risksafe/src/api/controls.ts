import { api } from './client'
import type { Control } from '../types'

export const controlsApi = {
  list:   ()                                    => api.get<Control[]>('/api/controls/'),
  create: (body: Partial<Control>)              => api.post<Control>('/api/controls/', body),
  update: (id: string, body: Partial<Control>)  => api.put<Control>(`/api/controls/${id}`, body),
  patch:  (id: string, body: Partial<Control>)  => api.patch<Control>(`/api/controls/${id}`, body),
  remove: (id: string)                          => api.delete<void>(`/api/controls/${id}`),
}
