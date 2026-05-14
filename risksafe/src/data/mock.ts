import type { Risk, Incident, ActionPlan, Vendor, Questionnaire, Contract, DashboardSummary } from '../types'

export const mockRisks: Risk[] = [
  { id: 'r1', name: 'Exploração de vulnerabilidade em sistema exposto à internet', description: 'Sistema crítico com porta 443 exposta sem WAF adequado.', category: 'Tecnológico', level: 'critical', probability: 5, impact: 5, score: 98, status: 'in_treatment', owner: 'João Silva', trend: 'up', createdAt: '2024-01-15', updatedAt: '2024-05-20' },
  { id: 'r2', name: 'Acesso não autorizado a dados sensíveis', description: 'Controlos de acesso insuficientes em base de dados com PII.', category: 'Tecnológico', level: 'critical', probability: 4, impact: 5, score: 95, status: 'open', owner: 'Ana Costa', trend: 'up', createdAt: '2024-02-10', updatedAt: '2024-05-18' },
  { id: 'r3', name: 'Ransomware em estações de trabalho', description: 'Ausência de EDR em 30% das estações.', category: 'Tecnológico', level: 'critical', probability: 4, impact: 5, score: 94, status: 'in_treatment', owner: 'Carlos Melo', trend: 'up', createdAt: '2024-01-20', updatedAt: '2024-05-15' },
  { id: 'r4', name: 'Falha de segmentação de rede', description: 'VLAN de produção e desenvolvimento partilham segmento.', category: 'Tecnológico', level: 'critical', probability: 3, impact: 5, score: 90, status: 'open', owner: 'Pedro Nunes', trend: 'stable', createdAt: '2024-03-01', updatedAt: '2024-05-10' },
  { id: 'r5', name: 'Phishing bem-sucedido', description: 'Colaboradores com baixa literacia de segurança.', category: 'Pessoas', level: 'critical', probability: 5, impact: 4, score: 88, status: 'in_treatment', owner: 'Sofia Lopes', trend: 'up', createdAt: '2024-02-28', updatedAt: '2024-05-22' },
  { id: 'r6', name: 'Fornecedor sem controlos de segurança adequados', description: 'Terceiro com acesso a sistemas internos sem avaliação de risco.', category: 'Terceiros', level: 'high', probability: 4, impact: 4, score: 82, status: 'open', owner: 'Miguel Ferreira', trend: 'up', createdAt: '2024-03-15', updatedAt: '2024-05-19' },
  { id: 'r7', name: 'Ausência de plano de continuidade', description: 'RTO/RPO não definidos para sistemas críticos.', category: 'Processos', level: 'high', probability: 3, impact: 4, score: 75, status: 'not_started', owner: 'Ana Costa', trend: 'stable', createdAt: '2024-04-01', updatedAt: '2024-05-01' },
  { id: 'r8', name: 'Gestão de patches insuficiente', description: 'Servidores com patches em atraso superior a 90 dias.', category: 'Tecnológico', level: 'high', probability: 4, impact: 3, score: 70, status: 'in_treatment', owner: 'Carlos Melo', trend: 'down', createdAt: '2024-02-15', updatedAt: '2024-05-20' },
  { id: 'r9', name: 'Dados sem classificação adequada', description: 'Ausência de política de classificação da informação.', category: 'Processos', level: 'medium', probability: 3, impact: 3, score: 55, status: 'in_treatment', owner: 'Sofia Lopes', trend: 'down', createdAt: '2024-03-20', updatedAt: '2024-05-17' },
  { id: 'r10', name: 'Acesso físico não controlado a datacenter', description: 'Registo de visitas desatualizado.', category: 'Físico', level: 'medium', probability: 2, impact: 4, score: 48, status: 'open', owner: 'Pedro Nunes', trend: 'stable', createdAt: '2024-04-10', updatedAt: '2024-05-05' },
]

export const mockIncidents: Incident[] = [
  { id: 'i1', name: 'Tentativa de acesso não autorizado', level: 'critical', date: '2024-05-30', status: 'investigating' },
  { id: 'i2', name: 'Malware detectado em endpoint', level: 'high', date: '2024-05-28', status: 'resolved' },
  { id: 'i3', name: 'Phishing relatado por utilizador', level: 'medium', date: '2024-05-27', status: 'resolved' },
  { id: 'i4', name: 'Falha de autenticação em sistema ERP', level: 'high', date: '2024-05-25', status: 'resolved' },
  { id: 'i5', name: 'Exposição acidental de dados em partilha de rede', level: 'medium', date: '2024-05-22', status: 'resolved' },
]

export const mockActionPlans: ActionPlan[] = [
  { id: 'ap1', riskId: 'r1', title: 'Implementar WAF em todos os sistemas expostos', status: 'in_progress', owner: 'João Silva', dueDate: '2024-06-30' },
  { id: 'ap2', riskId: 'r2', title: 'Revisão de permissões e implementação de PAM', status: 'in_progress', owner: 'Ana Costa', dueDate: '2024-07-15' },
  { id: 'ap3', riskId: 'r3', title: 'Rollout de EDR para 100% das estações', status: 'delayed', owner: 'Carlos Melo', dueDate: '2024-05-31' },
  { id: 'ap4', riskId: 'r5', title: 'Programa de formação e simulação de phishing', status: 'completed', owner: 'Sofia Lopes', dueDate: '2024-05-15' },
  { id: 'ap5', riskId: 'r8', title: 'Implementar processo de patch management', status: 'completed', owner: 'Carlos Melo', dueDate: '2024-04-30' },
  { id: 'ap6', riskId: 'r7', title: 'Desenvolver BCP e testar DR', status: 'not_started', owner: 'Ana Costa', dueDate: '2024-08-31' },
]

export const mockVendors: Vendor[] = [
  { id: 'v1', name: 'CloudSec Solutions', category: 'Cloud Services', criticality: 'critical', contactName: 'Maria Santos', contactEmail: 'maria@cloudsec.pt', country: 'Portugal', status: 'active', riskScore: 78, contractEnd: '2025-03-31', createdAt: '2023-01-15' },
  { id: 'v2', name: 'DataGuard Lda', category: 'Data Processing', criticality: 'high', contactName: 'Rui Alves', contactEmail: 'rui@dataguard.pt', country: 'Portugal', status: 'under_review', riskScore: 65, contractEnd: '2024-08-15', createdAt: '2022-06-01' },
  { id: 'v3', name: 'NetSecure Partners', category: 'Network Security', criticality: 'high', contactName: 'Ana Pereira', contactEmail: 'ana@netsecure.com', country: 'Espanha', status: 'active', riskScore: 52, contractEnd: '2025-12-31', createdAt: '2023-03-20' },
  { id: 'v4', name: 'TechSupport Global', category: 'IT Support', criticality: 'medium', contactName: 'John Smith', contactEmail: 'john@techsupport.com', country: 'Reino Unido', status: 'active', riskScore: 38, contractEnd: '2024-09-30', createdAt: '2022-11-10' },
  { id: 'v5', name: 'Limpeza & Facilities SA', category: 'Facilities', criticality: 'low', contactName: 'Fernando Cruz', contactEmail: 'fernando@facilities.pt', country: 'Portugal', status: 'active', riskScore: 15, contractEnd: '2025-01-31', createdAt: '2021-05-01' },
]

export const mockQuestionnaires: Questionnaire[] = [
  { id: 'q1', vendorId: 'v1', vendorName: 'CloudSec Solutions', title: 'Avaliação de Segurança 2024', status: 'completed', sentAt: '2024-03-01', dueDate: '2024-03-31', completedAt: '2024-03-28', score: 82 },
  { id: 'q2', vendorId: 'v2', vendorName: 'DataGuard Lda', title: 'Questionário RGPD', status: 'overdue', sentAt: '2024-04-15', dueDate: '2024-05-15' },
  { id: 'q3', vendorId: 'v3', vendorName: 'NetSecure Partners', title: 'Avaliação de Segurança 2024', status: 'in_progress', sentAt: '2024-05-01', dueDate: '2024-06-01' },
  { id: 'q4', vendorId: 'v4', vendorName: 'TechSupport Global', title: 'Avaliação de Segurança 2024', status: 'sent', sentAt: '2024-05-20', dueDate: '2024-06-20' },
]

export const mockContracts: Contract[] = [
  { id: 'c1', vendorId: 'v1', vendorName: 'CloudSec Solutions', title: 'Contrato de Serviços Cloud', startDate: '2024-04-01', endDate: '2025-03-31', value: 48000, slaCompliance: 99.2, status: 'active', autoRenew: true },
  { id: 'c2', vendorId: 'v2', vendorName: 'DataGuard Lda', title: 'DPA — Processamento de Dados', startDate: '2022-08-15', endDate: '2024-08-15', value: 12000, slaCompliance: 94.5, status: 'expiring_soon', autoRenew: false },
  { id: 'c3', vendorId: 'v3', vendorName: 'NetSecure Partners', title: 'SOC-as-a-Service', startDate: '2024-01-01', endDate: '2025-12-31', value: 96000, slaCompliance: 98.7, status: 'active', autoRenew: true },
  { id: 'c4', vendorId: 'v4', vendorName: 'TechSupport Global', title: 'Suporte IT Nível 2/3', startDate: '2022-10-01', endDate: '2024-09-30', value: 24000, slaCompliance: 88.1, status: 'expiring_soon', autoRenew: false },
]

export const mockDashboard: DashboardSummary = {
  totalRisks: 128,
  criticalRisks: 18,
  highRisks: 37,
  mediumRisks: 45,
  lowRisks: 28,
  riskScore: 72,
  riskTrends: [
    { month: 'Dez/23', critical: 12, high: 42, medium: 38, low: 30 },
    { month: 'Jan/24', critical: 14, high: 40, medium: 40, low: 29 },
    { month: 'Fev/24', critical: 15, high: 38, medium: 43, low: 28 },
    { month: 'Mar/24', critical: 17, high: 39, medium: 44, low: 27 },
    { month: 'Abr/24', critical: 16, high: 38, medium: 45, low: 28 },
    { month: 'Mai/24', critical: 18, high: 37, medium: 45, low: 28 },
  ],
  risksByCategory: [
    { category: 'Tecnológico', count: 52, percentage: 41 },
    { category: 'Pessoas', count: 28, percentage: 22 },
    { category: 'Processos', count: 22, percentage: 17 },
    { category: 'Terceiros', count: 16, percentage: 13 },
    { category: 'Físico', count: 10, percentage: 8 },
  ],
  actionPlanCompletion: 62,
  actionPlanStats: { completed: 23, inProgress: 15, delayed: 8, notStarted: 15 },
  securityIndicators: {
    incidents: 9, incidentsTrend: -18,
    criticalVulns: 24, criticalVulnsTrend: 14,
    highRiskAssets: 31, highRiskAssetsTrend: 10,
    ineffectiveControls: 12, ineffectiveControlsTrend: -7,
    treatmentRate: 78, treatmentRateTrend: 6,
  },
  topCriticalRisks: [
    { id: 'r1', name: 'Exploração de vulnerabilidade em sistema exposto à internet', level: 'critical', score: 98, trend: 'up' },
    { id: 'r2', name: 'Acesso não autorizado a dados sensíveis', level: 'critical', score: 95, trend: 'up' },
    { id: 'r3', name: 'Ransomware em estações de trabalho', level: 'critical', score: 94, trend: 'up' },
    { id: 'r4', name: 'Falha de segmentação de rede', level: 'critical', score: 90, trend: 'stable' },
    { id: 'r5', name: 'Phishing bem-sucedido', level: 'critical', score: 88, trend: 'up' },
  ],
  recentIncidents: mockIncidents.slice(0, 3),
  riskMatrix: [
    [3, 2, 1, 1, 0],
    [2, 4, 3, 1, 2],
    [1, 3, 6, 9, 6],
    [0, 2, 5, 7, 8],
    [0, 1, 2, 4, 7],
  ],
}
