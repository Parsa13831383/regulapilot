'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { FileText, Sparkles, Lock } from 'lucide-react';
import { analyseDocument, ApiError } from '@/lib/api';
import type { AnalysisResult, AuthSession } from '@/lib/types';

const PLACEHOLDER = `Paste FCA guidance, compliance notes, contract clauses, or internal policy text here...

Example document types:
• FCA regulatory guidance
• AML/KYC policy documents
• Credit risk assessments
• Customer onboarding procedures
• Internal audit findings
• Compliance review notes`;

const ERROR_MESSAGES: Record<string, string> = {
  invalid_token: 'Your session is no longer valid. Please enter a new access code.',
  no_remaining_runs: 'You have used all your processing runs. Please enter a new access code.',
};

const AUTH_ERRORS = new Set(['invalid_token', 'expired_session', 'no_remaining_runs']);

interface DocumentAnalyzerProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  onSessionUpdate: (session: AuthSession) => void;
  onSignOut?: (reason: string) => void;
  session: AuthSession | null;
  initialText?: string;
}

export function DocumentAnalyzer({
  onAnalysisComplete,
  onSessionUpdate,
  onSignOut,
  session,
  initialText,
}: DocumentAnalyzerProps) {
  const [documentText, setDocumentText] = useState(initialText ?? '');
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAnalyse =
    session !== null && session.remainingRuns > 0 && documentText.trim().length > 0;

  const handleAnalyse = async () => {
    if (!canAnalyse || !session) return;

    setIsAnalysing(true);
    setError(null);

    try {
      const { analysisResult, remainingRuns } = await analyseDocument(
        documentText,
        session,
      );

      onSessionUpdate({ ...session, remainingRuns });
      onAnalysisComplete(analysisResult);
    } catch (err) {
      if (err instanceof ApiError) {
        if (AUTH_ERRORS.has(err.detail) && onSignOut) {
          onSignOut(
            ERROR_MESSAGES[err.detail] ??
              'Your session is no longer valid. Please enter a new access code.',
          );
          return;
        }
        setError(
          err.status === 502
            ? 'AI processing failed. Please try again — the OpenAI key may not be set.'
            : `Request failed: ${err.detail}`,
        );
      } else {
        setError('Could not reach the backend. Is the server running on port 8000?');
      }
    } finally {
      setIsAnalysing(false);
    }
  };

  const lockReason = !session
    ? 'Enter your access code to analyse documents.'
    : session.remainingRuns === 0
      ? 'No remaining runs. Contact the team for more access.'
      : null;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <FileText className="h-5 w-5 text-primary" />
          Document Analysis
          {session && (
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {session.remainingRuns} run{session.remainingRuns !== 1 ? 's' : ''} remaining
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder={PLACEHOLDER}
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          className="min-h-[200px] resize-none border-input bg-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
          disabled={!session || session.remainingRuns === 0}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        {lockReason && !error && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-3.5 w-3.5 flex-shrink-0" />
            {lockReason}
          </div>
        )}

        <Button
          onClick={handleAnalyse}
          disabled={isAnalysing || !canAnalyse}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isAnalysing ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Analysing Document…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyse Document
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          AI will extract obligations, risks, and generate action items
        </p>
      </CardContent>
    </Card>
  );
}
