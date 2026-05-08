'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Shield, Download, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  {
    label: 'Start New Scan',
    description: 'Scan data brokers for your info',
    icon: Play,
    gradient: 'from-primary to-cyan-400',
    href: '/scans',
  },
  {
    label: 'View Matches',
    description: 'See where your data appears',
    icon: Shield,
    gradient: 'from-secondary to-purple-400',
    href: '/matches',
  },
  {
    label: 'Submit Removals',
    description: 'Request data removal',
    icon: Download,
    gradient: 'from-accent to-pink-400',
    href: '/removals',
  },
  {
    label: 'Setup Monitoring',
    description: 'Auto-scan on schedule',
    icon: Bell,
    gradient: 'from-warning to-amber-400',
    href: '/monitoring',
  },
];

export function QuickActions() {
  return (
    <Card className="border-border/50 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 gradient-text">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className={cn(
                  'h-auto p-4 flex flex-col items-start gap-3 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 group',
                  'hover:shadow-lg hover:-translate-y-1'
                )}
                asChild
              >
                <a href={action.href}>
                  <div className={cn(
                    'p-2 rounded-lg bg-gradient-to-br shadow-md group-hover:shadow-lg transition-all',
                    action.gradient
                  )}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </a>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
