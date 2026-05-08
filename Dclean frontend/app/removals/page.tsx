'use client';

import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpCircle,
  Trash2,
  Mail,
  FileText,
  ExternalLink,
  Zap,
  Timer,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-muted text-muted-foreground',
    gradient: 'from-muted to-muted',
  },
  in_progress: {
    label: 'In Progress',
    icon: Timer,
    color: 'bg-info text-info-foreground',
    gradient: 'from-info to-blue-400',
  },
  submitted: {
    label: 'Submitted',
    icon: Mail,
    color: 'bg-primary text-primary-foreground',
    gradient: 'from-primary to-cyan-400',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
    color: 'bg-success text-success-foreground',
    gradient: 'from-success to-emerald-400',
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    color: 'bg-destructive text-destructive-foreground',
    gradient: 'from-destructive to-red-400',
  },
  escalated: {
    label: 'Escalated',
    icon: ArrowUpCircle,
    color: 'bg-warning text-warning-foreground',
    gradient: 'from-warning to-amber-400',
  },
  rejected: {
    label: 'Rejected',
    icon: AlertCircle,
    color: 'bg-destructive text-destructive-foreground',
    gradient: 'from-destructive to-red-400',
  },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-success/10 text-success border-success/20' },
  medium: { label: 'Medium', color: 'bg-info/10 text-info border-info/20' },
  high: { label: 'High', color: 'bg-warning/10 text-warning border-warning/20' },
  critical: { label: 'Critical', color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const methodIcons: Record<string, any> = {
  email: Mail,
  form: FileText,
  api: Zap,
  manual: Trash2,
};

export default function RemovalsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [removals, setRemovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRemovals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.listRemovals({ page_size: 50 });
      setRemovals(response.results || []);
    } catch (err) {
      console.error('Failed to fetch removals:', err);
      setError('Failed to load removals. Make sure the backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRemovals();
  }, [fetchRemovals]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRemovals();
  };

  const filteredRemovals = removals.filter(removal => {
    if (filter === 'all') return true;
    return removal.status === filter;
  });

  const stats = {
    total: removals.length,
    pending: removals.filter(r => r.status === 'pending').length,
    inProgress: removals.filter(r => ['in_progress', 'submitted'].includes(r.status)).length,
    confirmed: removals.filter(r => r.status === 'confirmed').length,
    failed: removals.filter(r => r.status === 'failed').length,
    escalated: removals.filter(r => r.status === 'escalated').length,
  };

  if (loading) {
    return (
      <MainLayout pageTitle="Removals" pageSubtitle="Loading removals...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading your removal requests...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      pageTitle="Removals"
      pageSubtitle="Track your data removal requests"
    >
      <div className="space-y-6">
        {error && (
          <Card className="border-destructive/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-destructive">{error}</p>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Rate Banner */}
        <Card className="border-success/30 bg-gradient-to-r from-success/5 via-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-success to-primary animate-pulse-glow">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Removal Success Rate</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.confirmed} of {stats.total} requests completed
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-4xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
                    {stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
                </Button>
              </div>
            </div>
            
            {/* Progress Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30">
                <p className="text-2xl font-bold text-muted-foreground">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-info/20 to-info/10">
                <p className="text-2xl font-bold text-info">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-success/20 to-success/10">
                <p className="text-2xl font-bold text-success">{stats.confirmed}</p>
                <p className="text-xs text-muted-foreground">Confirmed</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-warning/20 to-warning/10">
                <p className="text-2xl font-bold text-warning">{stats.escalated}</p>
                <p className="text-xs text-muted-foreground">Escalated</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/10">
                <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({removals.filter(r => r.status === 'in_progress').length})</TabsTrigger>
            <TabsTrigger value="submitted">Submitted ({removals.filter(r => r.status === 'submitted').length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({stats.confirmed})</TabsTrigger>
            <TabsTrigger value="escalated">Escalated ({stats.escalated})</TabsTrigger>
            <TabsTrigger value="failed">Failed ({stats.failed})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Removals List */}
        <div className="space-y-4">
          {filteredRemovals.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">No Removals Found</h3>
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? "You haven't submitted any removal requests yet." 
                    : `No removal requests match the "${filter}" filter.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRemovals.map((removal) => {
              const status = statusConfig[removal.status as keyof typeof statusConfig];
              const StatusIcon = status?.icon || Clock;
              const priority = priorityConfig[removal.priority] || { label: 'Medium', color: 'bg-info/10 text-info border-info/20' };
              const MethodIcon = methodIcons[removal.method] || FileText;
              
              const createdDate = new Date(removal.created_at);
              const daysElapsed = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
              const estimatedDays = removal.estimated_days || 14;
              const progressPercent = Math.min((daysElapsed / estimatedDays) * 100, 100);
              
              return (
                <Card
                  key={removal.id}
                  className={cn(
                    'border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
                    'hover:border-primary/30'
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">{removal.source_name || removal.source || 'Unknown Source'}</h3>
                          <Badge className={cn('text-xs', status?.color)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status?.label || removal.status}
                          </Badge>
                          <Badge variant="outline" className={cn('text-xs', priority.color)}>
                            {priority.label}
                          </Badge>
                        </div>
                        
                        {removal.match_url && (
                          <a
                            href={removal.match_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1 mb-3"
                          >
                            {removal.match_url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MethodIcon className="h-4 w-4" />
                            <span className="capitalize">{removal.method || 'email'}</span>
                          </div>
                          <div>Attempts: {removal.attempts_count || removal.attempts || 0}</div>
                          <div>Submitted: {createdDate.toLocaleDateString()}</div>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        {removal.status === 'failed' && (
                          <Button size="sm" variant="destructive">
                            Retry
                          </Button>
                        )}
                        {removal.status === 'escalated' && (
                          <Button size="sm" className="bg-gradient-to-r from-warning to-amber-400">
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Timeline Progress */}
                    <div className="mt-4 p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>Day {daysElapsed} of {estimatedDays}</span>
                        <span>{Math.max(estimatedDays - daysElapsed, 0)} days remaining</span>
                      </div>
                      <Progress
                        value={progressPercent}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}
