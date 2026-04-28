'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Upload, Brain, AlertTriangle, CheckSquare } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Upload or paste document',
    description: 'Add FCA guidance, compliance notes, or policy documents',
    icon: Upload,
  },
  {
    number: '02',
    title: 'AI extracts obligations',
    description: 'Key requirements, owners, and deadlines identified automatically',
    icon: Brain,
  },
  {
    number: '03',
    title: 'Risks and tasks generated',
    description: 'Potential issues flagged with actionable task recommendations',
    icon: AlertTriangle,
  },
  {
    number: '04',
    title: 'Team tracks progress',
    description: 'Full audit trail for regulatory inspection readiness',
    icon: CheckSquare,
  },
];

export function HowItWorks() {
  return (
    <section className="border-b border-border bg-muted/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-muted-foreground">
            From document to action plan in four simple steps
          </p>
        </div>
        
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card 
                key={step.number} 
                className="group relative border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-3xl font-bold text-primary/30">
                      {step.number}
                    </span>
                    <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
