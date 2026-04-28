'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { StatsCards } from './stats-cards';
import { DocumentAnalyzer } from './document-analyzer';
import { AnalysisResults } from './analysis-results';
import { TaskBoard } from './task-board';
import { AuditTrail } from './audit-trail';
import { 
  dashboardStats, 
  mockTasks, 
  mockAuditTrail,
  mockAnalysisResult
} from '@/lib/mock-data';
import type { AnalysisResult } from '@/lib/types';

const sectionTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  documents: 'Document Analysis',
  obligations: 'Obligations',
  'risk-review': 'Risk Review',
  tasks: 'Task Board',
  'audit-trail': 'Audit Trail',
};

interface DashboardViewProps {
  onBack?: () => void;
}

export function DashboardView({ onBack }: DashboardViewProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <StatsCards stats={dashboardStats} />
            <div className="grid gap-6 lg:grid-cols-2">
              <DocumentAnalyzer onAnalysisComplete={handleAnalysisComplete} />
              {analysisResult && (
                <div className="lg:col-span-2">
                  <AnalysisResults result={analysisResult} />
                </div>
              )}
            </div>
          </div>
        );
      case 'documents':
        return (
          <div className="space-y-6">
            <DocumentAnalyzer onAnalysisComplete={handleAnalysisComplete} />
            {analysisResult && <AnalysisResults result={analysisResult} />}
          </div>
        );
      case 'obligations':
        return <AnalysisResults result={mockAnalysisResult} />;
      case 'risk-review':
        return (
          <div className="space-y-6">
            <AnalysisResults result={{
              ...mockAnalysisResult,
              obligations: [],
              recommendedActions: [],
            }} />
          </div>
        );
      case 'tasks':
        return <TaskBoard tasks={mockTasks} />;
      case 'audit-trail':
        return <AuditTrail events={mockAuditTrail} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="md:pl-64">
        <TopBar title={sectionTitles[activeSection] || 'RegulaPilot'} onBack={onBack} />
        <main className="p-4 pt-16 md:p-6 md:pt-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
