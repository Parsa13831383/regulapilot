// TypeScript types for RegulaPilot

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'to-review' | 'in-progress' | 'completed';

export interface Obligation {
  id: string;
  title: string;
  owner: string;
  priority: Priority;
  dueDate: string;
  sourceExcerpt: string;
}

export interface RiskFlag {
  id: string;
  title: string;
  description: string;
  severity: Priority;
}

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  owner: string;
  dueDate: string;
  linkedDocument: string;
  status: TaskStatus;
}

export interface AuditEvent {
  id: string;
  action: string;
  timestamp: string;
  user: string;
}

export interface AnalysisResult {
  summary: string;
  obligations: Obligation[];
  riskFlags: RiskFlag[];
  recommendedActions: string[];
}

export interface DashboardStats {
  documentsAnalysed: number;
  openObligations: number;
  highRiskItems: number;
  tasksGenerated: number;
}
