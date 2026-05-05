'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { StatsCards } from './stats-cards';
import { DocumentAnalyzer } from './document-analyzer';
import { AnalysisResults } from './analysis-results';
import { TaskBoard } from './task-board';
import { AuditTrail } from './audit-trail';
import type { AnalysisResult, DashboardStats } from '@/lib/types';

const emptyStats: DashboardStats = {
  documentsAnalysed: 0,
  openObligations: 0,
  highRiskItems: 0,
  tasksGenerated: 0,
};

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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
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
            <StatsCards stats={emptyStats} />
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
        return analysisResult ? (
          <AnalysisResults result={analysisResult} />
        ) : (
          <EmptyState message="Analyse a document to view extracted obligations." />
        );
      case 'risk-review':
        return analysisResult ? (
          <div className="space-y-6">
            <AnalysisResults result={{
              ...analysisResult,
              obligations: [],
              recommendedActions: [],
            }} />
          </div>
        ) : (
          <EmptyState message="Analyse a document to view risk flags." />
        );
      case 'tasks':
        return <TaskBoard tasks={[]} />;
      case 'audit-trail':
        return <AuditTrail events={[]} />;
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
