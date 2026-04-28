import type { 
  Obligation, 
  RiskFlag, 
  Task, 
  AuditEvent, 
  AnalysisResult, 
  DashboardStats 
} from './types';

export const dashboardStats: DashboardStats = {
  documentsAnalysed: 12,
  openObligations: 34,
  highRiskItems: 6,
  tasksGenerated: 48,
};

export const mockAnalysisResult: AnalysisResult = {
  summary: "This FCA guidance document outlines enhanced due diligence requirements for high-risk customers under the Money Laundering Regulations 2017. Key focus areas include customer risk assessment procedures, ongoing monitoring obligations, and record-keeping requirements. The document mandates specific actions for firms handling politically exposed persons (PEPs) and customers from high-risk third countries.",
  obligations: [
    {
      id: '1',
      title: 'Implement Enhanced Customer Due Diligence (EDD)',
      owner: 'Compliance Officer',
      priority: 'high',
      dueDate: '2024-03-15',
      sourceExcerpt: '"Firms must apply enhanced due diligence measures for customers identified as high-risk..."',
    },
    {
      id: '2',
      title: 'Update PEP Screening Procedures',
      owner: 'AML Team Lead',
      priority: 'high',
      dueDate: '2024-02-28',
      sourceExcerpt: '"Screening for PEPs must include family members and known close associates..."',
    },
    {
      id: '3',
      title: 'Establish Ongoing Monitoring Framework',
      owner: 'Risk Manager',
      priority: 'medium',
      dueDate: '2024-04-01',
      sourceExcerpt: '"Continuous monitoring of business relationships shall be conducted proportionate to risk..."',
    },
    {
      id: '4',
      title: 'Maintain Transaction Records for 5 Years',
      owner: 'Operations Lead',
      priority: 'medium',
      dueDate: '2024-03-30',
      sourceExcerpt: '"Records of customer due diligence and transaction data must be retained for at least five years..."',
    },
    {
      id: '5',
      title: 'Annual AML Training for All Staff',
      owner: 'HR Manager',
      priority: 'low',
      dueDate: '2024-06-01',
      sourceExcerpt: '"Staff must receive regular training on recognising and handling suspicious transactions..."',
    },
  ],
  riskFlags: [
    {
      id: '1',
      title: 'Missing Evidence',
      description: 'No documented evidence of current PEP screening procedures in customer onboarding flow.',
      severity: 'high',
    },
    {
      id: '2',
      title: 'Unclear Ownership',
      description: 'The document references "designated compliance personnel" but specific roles are not assigned.',
      severity: 'medium',
    },
    {
      id: '3',
      title: 'Potential Regulatory Deadline',
      description: 'Implementation deadline of Q1 2024 mentioned but no specific date provided for EDD framework.',
      severity: 'high',
    },
  ],
  recommendedActions: [
    'Assign compliance owner for EDD implementation',
    'Request evidence of existing PEP screening procedures',
    'Schedule legal review of updated AML policy',
    'Update internal policy documentation',
    'Prepare audit note for regulatory inspection',
  ],
};

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Review EDD Implementation Plan',
    priority: 'high',
    owner: 'Sarah Chen',
    dueDate: '2024-02-20',
    linkedDocument: 'FCA Guidance 2024',
    status: 'to-review',
  },
  {
    id: '2',
    title: 'Update PEP Screening Checklist',
    priority: 'high',
    owner: 'James Wilson',
    dueDate: '2024-02-22',
    linkedDocument: 'AML Policy v3.2',
    status: 'to-review',
  },
  {
    id: '3',
    title: 'Document Customer Risk Categories',
    priority: 'medium',
    owner: 'Emily Roberts',
    dueDate: '2024-02-25',
    linkedDocument: 'KYC Review Framework',
    status: 'in-progress',
  },
  {
    id: '4',
    title: 'Schedule Compliance Training',
    priority: 'low',
    owner: 'Michael Brown',
    dueDate: '2024-03-01',
    linkedDocument: 'Training Requirements',
    status: 'in-progress',
  },
  {
    id: '5',
    title: 'Finalize Record Retention Policy',
    priority: 'medium',
    owner: 'Sarah Chen',
    dueDate: '2024-02-15',
    linkedDocument: 'Data Governance Policy',
    status: 'completed',
  },
  {
    id: '6',
    title: 'Complete Q4 Risk Assessment',
    priority: 'high',
    owner: 'James Wilson',
    dueDate: '2024-02-10',
    linkedDocument: 'Credit Risk Policy',
    status: 'completed',
  },
];

export const mockAuditTrail: AuditEvent[] = [
  {
    id: '1',
    action: 'Document uploaded',
    timestamp: '2024-02-15 09:30:00',
    user: 'Sarah Chen',
  },
  {
    id: '2',
    action: 'AI summary generated',
    timestamp: '2024-02-15 09:30:45',
    user: 'System',
  },
  {
    id: '3',
    action: 'Obligations extracted (5 items)',
    timestamp: '2024-02-15 09:31:02',
    user: 'System',
  },
  {
    id: '4',
    action: 'Risk review completed',
    timestamp: '2024-02-15 10:15:00',
    user: 'James Wilson',
  },
  {
    id: '5',
    action: 'Tasks created (6 items)',
    timestamp: '2024-02-15 10:20:00',
    user: 'System',
  },
  {
    id: '6',
    action: 'Compliance owner assigned',
    timestamp: '2024-02-15 11:00:00',
    user: 'Emily Roberts',
  },
];

export const placeholderDocumentText = `Paste FCA guidance, compliance notes, contract clauses, or internal policy text here...

Example document types:
• FCA regulatory guidance
• AML/KYC policy documents
• Credit risk assessments
• Customer onboarding procedures
• Internal audit findings
• Compliance review notes`;
