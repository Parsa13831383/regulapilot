'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  User,
  Quote
} from 'lucide-react';
import type { AnalysisResult, Priority } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const variants = {
    low: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
    medium: 'bg-warning/20 text-warning border-warning/30',
    high: 'bg-destructive/20 text-destructive border-destructive/30',
  };
  
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', variants[priority])}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <FileText className="h-5 w-5 text-primary" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {result.summary}
          </p>
        </CardContent>
      </Card>

      {/* Key Obligations */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Key Obligations
            <Badge variant="secondary" className="ml-2">
              {result.obligations.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.obligations.map((obligation) => (
            <div
              key={obligation.id}
              className="rounded-lg border border-border bg-muted/30 p-4 transition-all hover:border-primary/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <h4 className="font-medium text-foreground">{obligation.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      {obligation.owner}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {obligation.dueDate}
                    </div>
                    <PriorityBadge priority={obligation.priority} />
                  </div>
                  {obligation.sourceExcerpt && (
                    <div className="flex items-start gap-2 rounded bg-muted/50 p-2">
                      <Quote className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                      <p className="text-xs italic text-muted-foreground">
                        {obligation.sourceExcerpt}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Risk Flags */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Risk Flags
            <Badge variant="destructive" className="ml-2">
              {result.riskFlags.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.riskFlags.map((risk) => (
            <div
              key={risk.id}
              className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-foreground">{risk.title}</h4>
                  <PriorityBadge priority={risk.severity} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {risk.description}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommended Actions */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {result.recommendedActions.map((action, index) => (
              <li
                key={index}
                className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 transition-all hover:border-success/50"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/20 text-xs font-medium text-success">
                  {index + 1}
                </div>
                <span className="text-sm text-foreground">{action}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
