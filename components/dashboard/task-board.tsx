'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText } from 'lucide-react';
import type { Task, Priority, TaskStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TaskBoardProps {
  tasks: Task[];
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

function TaskCard({ task }: { task: Task }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium leading-tight text-foreground">{task.title}</h4>
          <PriorityBadge priority={task.priority} />
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            {task.owner}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            {task.dueDate}
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            <span className="truncate">{task.linkedDocument}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'to-review', title: 'To Review', color: 'bg-warning' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-primary' },
  { id: 'completed', title: 'Completed', color: 'bg-success' },
];

export function TaskBoard({ tasks }: TaskBoardProps) {
  return (
    <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.id);
        return (
          <Card key={column.id} className="border-border bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-card-foreground">
                <div className={cn('h-2 w-2 rounded-full', column.color)} />
                {column.title}
                <Badge variant="secondary" className="ml-auto">
                  {columnTasks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {columnTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground">No tasks</p>
                </div>
              ) : (
                columnTasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
