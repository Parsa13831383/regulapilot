'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { FileText, Sparkles } from 'lucide-react';
import { placeholderDocumentText, mockAnalysisResult } from '@/lib/mock-data';
import { sampleDocument } from '@/lib/sample-document';
import type { AnalysisResult } from '@/lib/types';

interface DocumentAnalyzerProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  initialText?: string;
}

export function DocumentAnalyzer({ onAnalysisComplete, initialText }: DocumentAnalyzerProps) {
  const [documentText, setDocumentText] = useState(initialText || '');
  const [isAnalysing, setIsAnalysing] = useState(false);

  const handleAnalyse = async () => {
    if (!documentText.trim()) return;
    
    setIsAnalysing(true);
    
    // TODO: Replace with actual LLM API call
    // const response = await fetch('/api/analyse', {
    //   method: 'POST',
    //   body: JSON.stringify({ document: documentText }),
    // });
    // const result = await response.json();
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Use mock data for demo
    onAnalysisComplete(mockAnalysisResult);
    setIsAnalysing(false);
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
          placeholder={placeholderDocumentText}
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          className="min-h-[200px] resize-none border-input bg-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
        />
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
        <div className="flex items-center justify-center gap-2">
          <p className="text-xs text-muted-foreground">
            AI will extract obligations, risks, and generate action items
          </p>
          {!documentText && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <button
                onClick={() => setDocumentText(sampleDocument)}
                className="text-xs text-primary hover:underline"
              >
                Load sample document
              </button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
