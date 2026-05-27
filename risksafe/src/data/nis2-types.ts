// Types matching the structure of nis2-roadmap-data.json

export interface Nis2Role {
  role: string
  fullName: string
  description: string
  reportsTo: string
  dedication: string
  nis2Ref: string | null
  rjcRef: string | null
  isoRef: string | null
  nistRef: string | null
  responsibilities: string[]
}

export interface Nis2RaciRow {
  activity: string
  ISO: string | null
  Jurídico: string | null
  DPO: string | null
  IT: string | null
  SOC: string | null
  RH: string | null
  Compras: string | null
  Admin: string | null
}

export interface Nis2Obligation {
  obligation: string
  legalRef: string
  owner: string | null
  description: string | null
  deadline: string | null
}

export interface Nis2ComplianceLevel {
  level: string
  description: string
}

export interface Nis2RoadmapTask {
  phase: string
  task: string
  startMonth: number
  durationMonths: number
  owner: string | null
  priority: string | null
  nis2Ref: string | null
  rjcRef: string | null
  isoRef: string | null
  nistRef: string | null
}

export interface Nis2RoadmapData {
  roles: Nis2Role[]
  raci: Nis2RaciRow[]
  obligations: Nis2Obligation[]
  complianceLevels: Nis2ComplianceLevel[]
  roadmap: Nis2RoadmapTask[]
}
