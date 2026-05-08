'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  gradient: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  gradient,
}: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Gradient Background */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300',
        gradient
      )} />
      
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            'p-3 rounded-xl bg-gradient-to-br shadow-lg',
            gradient
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            changeType === 'positive' && 'text-success bg-success/10',
            changeType === 'negative' && 'text-destructive bg-destructive/10',
            changeType === 'neutral' && 'text-muted-foreground bg-muted'
          )}>
            {changeType === 'positive' && <TrendingUp className="h-3 w-3" />}
            {changeType === 'negative' && <TrendingDown className="h-3 w-3" />}
            {change}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {value}
          </p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}
