'use client';

import { useState } from 'react';
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { FounderDemo } from '@/components/landing/founder-demo';
import { DashboardView } from '@/components/dashboard/dashboard-view';

type View = 'landing' | 'dashboard';

export default function Home() {
  const [view, setView] = useState<View>('landing');

  if (view === 'dashboard') {
    return <DashboardView onBack={() => setView('landing')} />;
  }

  return (
    <main className="min-h-screen bg-background">
      <Hero 
        onTryDemo={() => setView('dashboard')} 
        onViewWorkflow={() => setView('dashboard')} 
      />
      <HowItWorks />
      <FounderDemo />
      
      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <svg
                  className="h-4 w-4 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <span className="font-semibold text-foreground">RegulaPilot</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-native compliance workflows for fintech teams
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
