'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Rocket, Zap, Eye, ClipboardList } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Reduce manual review time',
    description: 'AI processes documents in seconds, not hours',
  },
  {
    icon: Eye,
    title: 'Improve operational visibility',
    description: 'Clear overview of obligations and risks across all documents',
  },
  {
    icon: ClipboardList,
    title: 'Structured follow-up actions',
    description: 'From unstructured documents to trackable tasks',
  },
];

export function FounderDemo() {
  return (
    <section className="border-b border-border bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Rocket className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Built for Fast Validation
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            This MVP is designed to test whether fintech teams would use AI to reduce manual compliance review time, improve operational visibility, and create structured follow-up actions from unstructured documents.
          </p>
        </div>
        
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title} 
                className="border-border bg-card transition-all hover:border-primary/50"
              >
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
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
