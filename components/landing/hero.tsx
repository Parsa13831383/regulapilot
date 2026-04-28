'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ArrowRight, Play, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

interface HeroProps {
  onTryDemo: () => void;
  onViewWorkflow: () => void;
}

export function Hero({ onTryDemo, onViewWorkflow }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      
      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28 lg:py-32">
        <div className="flex flex-col items-center text-center">
          {/* Logo badge */}
          <div className="mb-8 flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">RegulaPilot</span>
          </div>
          
          {/* Headline */}
          <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            AI Compliance Workflows for{' '}
            <span className="text-primary">Fintech Teams</span>
          </h1>
          
          {/* Subheadline */}
          <p className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Turn complex regulatory documents into clear obligations, risks, and action plans in minutes.
          </p>
          
          {/* CTA buttons */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button 
              size="lg" 
              onClick={onTryDemo}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Try Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={onViewWorkflow}
              className="border-border text-foreground hover:bg-muted"
            >
              <Play className="mr-2 h-4 w-4" />
              View Workflow
            </Button>
          </div>
          
          {/* Trust line */}
          <p className="mt-10 text-sm text-muted-foreground">
            Built for regulated teams that need speed, clarity, and auditability.
          </p>
          
          {/* Feature badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Badge variant="outline" className="gap-1.5 border-border bg-muted/50 px-3 py-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">FCA Guidance</span>
            </Badge>
            <Badge variant="outline" className="gap-1.5 border-border bg-muted/50 px-3 py-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              <span className="text-muted-foreground">AML/KYC Policies</span>
            </Badge>
            <Badge variant="outline" className="gap-1.5 border-border bg-muted/50 px-3 py-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              <span className="text-muted-foreground">Risk Assessment</span>
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
