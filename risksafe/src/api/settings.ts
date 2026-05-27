import { api } from './client'
import type { AppSettings } from '../types'

export const settingsApi = {
  get:    ()                          => api.get<AppSettings>('/api/settings'),
  update: (body: Partial<AppSettings>) => api.put<AppSettings>('/api/settings', body),
}
