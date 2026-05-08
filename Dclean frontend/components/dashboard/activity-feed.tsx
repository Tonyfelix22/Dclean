'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const activities = [
  {
    id: 1,
    action: 'Scan completed',
    details: 'Found 12 new matches across 5 sources',
    time: '2 minutes ago',
    type: 'success' as const,
    icon: CheckCircle,
  },
  {
    id: 2,
    action: 'Removal submitted',
    details: 'Data removal request sent to Whitepages',
    time: '15 minutes ago',
    type: 'info' as const,
    icon: Activity,
  },
  {
    id: 3,
    action: 'High risk match found',
    details: 'Personal info detected on Spokeo with 95% confidence',
    time: '1 hour ago',
    type: 'warning' as const,
    icon: AlertCircle,
  },
  {
    id: 4,
    action: 'Monitoring scheduled',
    details: 'Next automatic scan in 6 days',
    time: '3 hours ago',
    type: 'neutral' as const,
    icon: Clock,
  },
  {
    id: 5,
    action: 'Removal confirmed',
    details: 'Your data has been removed from Intelius',
    time: '5 hours ago',
    type: 'success' as const,
    icon: CheckCircle,
  },
  {
    id: 6,
    action: 'Scan started',
    details: 'Full scan initiated across 45 sources',
    time: '1 day ago',
    type: 'info' as const,
    icon: Activity,
  },
];

const typeStyles = {
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/20',
  },
  info: {
    bg: 'bg-info/10',
    text: 'text-info',
    border: 'border-info/20',
  },
  neutral: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
  },
};

export function ActivityFeed() {
  return (
    <Card className="border-border/50 hover:border-primary/20 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Latest privacy events</p>
          </div>
          <div className="p-2 rounded-lg bg-gradient-to-br from-secondary to-accent">
            <Activity className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon;
              const style = typeStyles[activity.type];
              
              return (
                <div
                  key={activity.id}
                  className={cn(
                    'flex gap-3 p-3 rounded-xl border transition-all hover:shadow-md',
                    style.bg,
                    style.border
                  )}
                >
                  <div className={cn('flex-shrink-0 p-2 rounded-lg', style.text)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>
                    <p className="text-xs text-muted-foreground mt-2">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
