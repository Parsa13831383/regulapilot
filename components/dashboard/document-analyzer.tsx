'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { FileText, Sparkles } from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';

const PLACEHOLDER = `Paste FCA guidance, compliance notes, contract clauses, or internal policy text here...

Example document types:
• FCA regulatory guidance
• AML/KYC policy documents
• Credit risk assessments
• Customer onboarding procedures
• Internal audit findings
• Compliance review notes`;

interface DocumentAnalyzerProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  initialText?: string;
}

export function DocumentAnalyzer({ onAnalysisComplete, initialText }: DocumentAnalyzerProps) {
  const [documentText, setDocumentText] = useState(initialText || '');
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyse = async () => {
    if (!documentText.trim()) return;

    setIsAnalysing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document: documentText }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result: AnalysisResult = await response.json();
      onAnalysisComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalysing(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <FileText className="h-5 w-5 text-primary" />
          Document Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder={PLACEHOLDER}
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          className="min-h-[200px] resize-none border-input bg-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button
          onClick={handleAnalyse}
          disabled={isAnalysing || !documentText.trim()}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isAnalysing ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Analysing Document...
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
