'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Shield, ArrowLeft, KeyRound } from 'lucide-react';
import { redeemCode, createDemoUser, ApiError } from '@/lib/api';
import type { AuthSession } from '@/lib/types';

interface AccessCodeFormProps {
  onSuccess: (session: AuthSession) => void;
  onBack: () => void;
  initialMessage?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid_code: 'This access code is not recognised. Please check and try again.',
  already_used: 'This access code has already been used. Each code is single-use — request a new one.',
  expired_code: 'This access code has expired (codes are valid for 3 days). Please request a new one.',
  no_remaining_runs: 'This access code has no remaining runs. Please request a new one.',
};

export function AccessCodeForm({ onSuccess, onBack, initialMessage }: AccessCodeFormProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);

    try {
      const { token, remainingRuns } = await redeemCode(trimmed);
      const user = await createDemoUser();

      const session: AuthSession = {
        token,
        remainingRuns,
        userId: user.id,
      };

      localStorage.setItem('regulapilot_session', JSON.stringify(session));
      onSuccess(session);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(ERROR_MESSAGES[err.detail] ?? 'Something went wrong. Please try again.');
      } else {
        setError('Could not reach the server. Is the backend running on port 8000?');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4">
        {/* Back link */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </button>

        <Card className="border-border bg-card">
          <CardHeader className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <CardTitle className="text-card-foreground">Enter your access code</CardTitle>
            <p className="text-sm text-muted-foreground">
              RegulaPilot is currently in private beta. Enter your invite code to continue.
            </p>
          </CardHeader>

          <CardContent>
            {initialMessage && (
              <div className="mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
                {initialMessage}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="e.g. BETA-001"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="pl-9 uppercase tracking-widest"
                    autoFocus
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || !code.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Verifying…
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have a code?{' '}
          <a
            href="mailto:qudo1383@gmail.com"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Request access
          </a>
        </p>
      </div>
    </div>
  );
}
