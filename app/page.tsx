'use client';

import { useState, useEffect } from 'react';
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { FounderDemo } from '@/components/landing/founder-demo';
import { AccessCodeForm } from '@/components/landing/access-code-form';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { OnboardingPage } from '@/components/landing/onboarding-page';
import type { AuthSession } from '@/lib/types';

type View = 'landing' | 'onboarding' | 'access-code' | 'dashboard';

const SESSION_KEY = 'regulapilot_session';

function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

function saveSession(session: AuthSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export default function Home() {
  const [view, setView] = useState<View>('landing');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [signOutReason, setSignOutReason] = useState<string | null>(null);

  // Hydrate session from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const stored = loadSession();
    if (stored) setSession(stored);
  }, []);

  const handleTryDemo = () => {
    if (session) {
      setView('dashboard');
    } else {
      setView('access-code');
    }
  };

  const handleViewWorkflow = () => {
    setView('onboarding');
  };

  const handleSessionReady = (newSession: AuthSession) => {
    saveSession(newSession);
    setSession(newSession);
    setSignOutReason(null);
    setView('dashboard');
  };

  const handleSessionUpdate = (updated: AuthSession) => {
    saveSession(updated);
    setSession(updated);
  };

  // Called with no reason for manual sign-out (→ landing).
  // Called with a reason by auth errors (→ access-code with message).
  const handleSignOut = (reason?: string) => {
    clearSession();
    setSession(null);
    if (reason) {
      setSignOutReason(reason);
      setView('access-code');
    } else {
      setSignOutReason(null);
      setView('landing');
    }
  };

  if (view === 'onboarding') {
    return (
      <OnboardingPage
        onBack={() => setView('landing')}
        onGetAccess={() => setView('access-code')}
      />
    );
  }

  if (view === 'access-code') {
    return (
      <AccessCodeForm
        onSuccess={handleSessionReady}
        onBack={() => { setSignOutReason(null); setView('landing'); }}
        initialMessage={signOutReason ?? undefined}
      />
    );
  }

  if (view === 'dashboard') {
    return (
      <DashboardView
        session={session}
        onSessionUpdate={handleSessionUpdate}
        onBack={() => setView('landing')}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Hero
        onTryDemo={handleTryDemo}
        onViewWorkflow={handleViewWorkflow}
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
