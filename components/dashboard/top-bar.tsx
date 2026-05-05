'use client';

import { ArrowLeft, Bell, Search, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TopBarProps {
  title: string;
  onBack?: () => void;
  onSignOut?: () => void;
  remainingRuns?: number;
}

export function TopBar({ title, onBack, onSignOut, remainingRuns }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to landing</span>
          </Button>
        )}
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {remainingRuns !== undefined && (
          <Badge
            variant="outline"
            className="hidden gap-1.5 border-border text-xs text-muted-foreground sm:flex"
          >
            {remainingRuns} run{remainingRuns !== 1 ? 's' : ''} left
          </Badge>
        )}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>
        {onSignOut && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSignOut}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        )}
      </div>
    </header>
  );
}
