'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, User, Bot, CheckCircle2 } from 'lucide-react';
import type { AuditEvent } from '@/lib/types';

interface AuditTrailProps {
  events: AuditEvent[];
}

export function AuditTrail({ events }: AuditTrailProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <History className="h-5 w-5 text-primary" />
          Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {events.map((event, index) => {
            const isSystem = event.user === 'System';
            const isLast = index === events.length - 1;
            
            return (
              <div key={event.id} className="relative flex gap-4 pb-6">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-[15px] top-8 h-full w-px bg-border" />
                )}
                
                {/* Icon */}
                <div className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                  {isSystem ? (
                    <Bot className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    <span className="font-medium text-foreground">{event.action}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{event.user}</span>
                    <span>•</span>
                    <time>{event.timestamp}</time>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
