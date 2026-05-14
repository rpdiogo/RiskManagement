import { api } from './client'
import type { Vendor, Questionnaire, Contract } from '../types'

export const vendorsApi = {
  list:   ()                         => api.get<Vendor[]>('/api/tprm/vendors/'),
  create: (body: Partial<Vendor>)    => api.post<Vendor>('/api/tprm/vendors/', body),
  update: (id: string, body: Partial<Vendor>) => api.put<Vendor>(`/api/tprm/vendors/${id}`, body),
  remove: (id: string)               => api.delete<void>(`/api/tprm/vendors/${id}`),
}

export const questionnairesApi = {
  list:     ()                              => api.get<Questionnaire[]>('/api/tprm/questionnaires/'),
  send:     (body: { vendor_id: string; title: string; due_date: string }) =>
              api.post<Questionnaire>('/api/tprm/questionnaires/', body),
  complete: (id: string, score: number)    => api.patch<Questionnaire>(`/api/tprm/questionnaires/${id}/complete?score=${score}`),
}

export const contractsApi = {
  list:   ()                          => api.get<Contract[]>('/api/tprm/contracts/'),
  create: (body: Partial<Contract>)   => api.post<Contract>('/api/tprm/contracts/', body),
  remove: (id: string)                => api.delete<void>(`/api/tprm/contracts/${id}`),
}
