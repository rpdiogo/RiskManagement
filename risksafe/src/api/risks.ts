import { api } from './client'
import type { Risk, DashboardSummary, ActionPlan } from '../types'

export const risksApi = {
  list:    ()                      => api.get<Risk[]>('/api/risks/'),
  create:  (body: Partial<Risk>)   => api.post<Risk>('/api/risks/', body),
  update:  (id: string, body: Partial<Risk>) => api.put<Risk>(`/api/risks/${id}`, body),
  remove:  (id: string)            => api.delete<void>(`/api/risks/${id}`),
  dashboard: ()                    => api.get<DashboardSummary>('/api/dashboard/summary'),
}

export const actionPlansApi = {
  list:   (riskId?: string) => api.get<ActionPlan[]>(`/api/action-plans/${riskId ? `?risk_id=${riskId}` : ''}`),
  create: (body: Partial<ActionPlan>) => api.post<ActionPlan>('/api/action-plans/', body),
  update: (id: string, body: Partial<ActionPlan>) => api.put<ActionPlan>(`/api/action-plans/${id}`, body),
  remove: (id: string) => api.delete<void>(`/api/action-plans/${id}`),
}
