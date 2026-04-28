'use client';

import { Card, CardContent } from '@/components/ui/card';
import { FileText, ClipboardList, AlertTriangle, CheckSquare } from 'lucide-react';
import type { DashboardStats } from '@/lib/types';

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const items = [
    {
      label: 'Documents Analysed',
      value: stats.documentsAnalysed,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Open Obligations',
      value: stats.openObligations,
      icon: ClipboardList,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      label: 'High-Risk Items',
      value: stats.highRiskItems,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      label: 'Tasks Generated',
      value: stats.tasksGenerated,
      icon: CheckSquare,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="border-border bg-card transition-all hover:border-primary/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-3xl font-bold text-card-foreground">{item.value}</p>
                </div>
                <div className={`rounded-lg p-3 ${item.bgColor}`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
