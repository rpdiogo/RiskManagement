export type RiskLevel = 'critical' | 'high' | 'medium' | 'low'
export type RiskCategory = 'Tecnológico' | 'Pessoas' | 'Processos' | 'Terceiros' | 'Físico'
export type RiskStatus = 'open' | 'in_treatment' | 'mitigated' | 'accepted' | 'closed' | 'not_started'
export type TrendDirection = 'up' | 'down' | 'stable'

export interface Risk {
  id: string
  name: string
  description: string
  category: RiskCategory
  level: RiskLevel
  probability: number
  impact: number
  score: number
  status: RiskStatus
  owner: string
  trend: TrendDirection
  createdAt: string
  updatedAt: string
  vendorId?: string
}

export interface Incident {
  id: string
  name: string
  level: RiskLevel
  date: string
  status: 'open' | 'investigating' | 'resolved'
}

export interface ActionPlan {
  id: string
  riskId: string
  title: string
  status: 'completed' | 'in_progress' | 'delayed' | 'not_started'
  owner: string
  dueDate: string
}

export interface Vendor {
  id: string
  name: string
  category: string
  criticality: RiskLevel
  contactName: string
  contactEmail: string
  country: string
  status: 'active' | 'inactive' | 'under_review'
  riskScore: number
  contractEnd?: string
  createdAt: string
}

export interface VendorRisk extends Risk {
  vendorId: string
  vendorName: string
}

export interface Questionnaire {
  id: string
  vendorId: string
  vendorName: string
  title: string
  status: 'draft' | 'sent' | 'in_progress' | 'completed' | 'overdue'
  sentAt?: string
  dueDate?: string
  completedAt?: string
  score?: number
}

export interface Contract {
  id: string
  vendorId: string
  vendorName: string
  title: string
  startDate: string
  endDate: string
  value?: number
  slaCompliance: number
  status: 'active' | 'expiring_soon' | 'expired' | 'draft'
  autoRenew: boolean
}

export interface DashboardSummary {
  totalRisks: number
  criticalRisks: number
  highRisks: number
  mediumRisks: number
  lowRisks: number
  riskScore: number
  riskTrends: { month: string; critical: number; high: number; medium: number; low: number }[]
  risksByCategory: { category: string; count: number; percentage: number }[]
  actionPlanCompletion: number
  actionPlanStats: { completed: number; inProgress: number; delayed: number; notStarted: number }
  securityIndicators: {
    incidents: number; incidentsTrend: number
    criticalVulns: number; criticalVulnsTrend: number
    highRiskAssets: number; highRiskAssetsTrend: number
    ineffectiveControls: number; ineffectiveControlsTrend: number
    treatmentRate: number; treatmentRateTrend: number
  }
  topCriticalRisks: { id: string; name: string; level: RiskLevel; score: number; trend: TrendDirection }[]
  recentIncidents: Incident[]
  riskMatrix: number[][]
}
