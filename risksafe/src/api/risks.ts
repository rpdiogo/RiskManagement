import { api } from './client'
import type { Risk, DashboardSummary } from '../types'

export const risksApi = {
  list:    ()                      => api.get<Risk[]>('/api/risks/'),
  create:  (body: Partial<Risk>)   => api.post<Risk>('/api/risks/', body),
  update:  (id: string, body: Partial<Risk>) => api.put<Risk>(`/api/risks/${id}`, body),
  remove:  (id: string)            => api.delete<void>(`/api/risks/${id}`),
  dashboard: ()                    => api.get<DashboardSummary>('/api/dashboard/summary'),
}
