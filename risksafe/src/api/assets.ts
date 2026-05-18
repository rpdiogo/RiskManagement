import { api } from './client'
import type { Asset } from '../types'

export const assetsApi = {
  list:   ()                           => api.get<Asset[]>('/api/assets/'),
  create: (body: Partial<Asset>)       => api.post<Asset>('/api/assets/', body),
  update: (id: string, body: Partial<Asset>) => api.put<Asset>(`/api/assets/${id}`, body),
  remove: (id: string)                 => api.delete<void>(`/api/assets/${id}`),
}
