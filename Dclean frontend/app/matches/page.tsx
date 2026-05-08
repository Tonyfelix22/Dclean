'use client';

import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  Shield,
  Eye,
  Filter,
  ArrowUpDown,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fieldIcons: Record<string, any> = {
  name: User,
  email: Mail,
  phone: Phone,
  address: MapPin,
  relatives: User,
  username: User,
};

const riskLevel = (risk: number) => {
  if (risk >= 80) return { label: 'Critical', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' };
  if (risk >= 60) return { label: 'High', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' };
  if (risk >= 40) return { label: 'Medium', color: 'text-info', bg: 'bg-info/10', border: 'border-info/30' };
  return { label: 'Low', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' };
};

const statusConfig = {
  active: { label: 'Active', icon: AlertCircle, color: 'bg-destructive text-destructive-foreground' },
  removal_pending: { label: 'Removal Pending', icon: Clock, color: 'bg-warning text-warning-foreground' },
  removed: { label: 'Removed', icon: CheckCircle, color: 'bg-success text-success-foreground' },
  false_positive: { label: 'False Positive', icon: XCircle, color: 'bg-muted text-muted-foreground' },
  disputed: { label: 'Disputed', icon: AlertTriangle, color: 'bg-info text-info-foreground' },
  unresolvable: { label: 'Unresolvable', icon: XCircle, color: 'bg-muted text-muted-foreground' },
};

export default function MatchesPage() {
  const [filter, setFilter] = useState<string>('all');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.listMatches({ page_size: 50 });
      setMatches(response.results || []);
    } catch (err) {
      console.error('Failed to fetch matches:', err);
      setError('Failed to load matches. Make sure the backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMatches();
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    return match.status === filter;
  });

  const stats = {
    total: matches.length,
    active: matches.filter(m => m.status === 'active').length,
    pending: matches.filter(m => m.status === 'removal_pending').length,
    removed: matches.filter(m => m.status === 'removed').length,
    disputed: matches.filter(m => m.status === 'disputed').length,
    falsePositive: matches.filter(m => m.status === 'false_positive').length,
  };

  if (loading) {
    return (
      <MainLayout pageTitle="Matches" pageSubtitle="Loading matches...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading your matches...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      pageTitle="Matches"
      pageSubtitle={`${stats.total} instances of your personal data found online`}
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

        {/* Risk Summary Banner */}
        <Card className="border-destructive/30 bg-gradient-to-r from-destructive/5 via-warning/5 to-success/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-destructive to-warning">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Privacy Risk Overview</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.active} active exposures detected
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-3xl font-bold text-destructive">
                    {stats.total > 0 ? Math.round(matches.reduce((acc, m) => acc + (m.risk_score || 0), 0) / stats.total) : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Risk Score</p>
                </div>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-destructive/10">
                <p className="text-2xl font-bold text-destructive">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-warning/10">
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-success/10">
                <p className="text-2xl font-bold text-success">{stats.removed}</p>
                <p className="text-xs text-muted-foreground">Removed</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-2xl font-bold text-muted-foreground">{stats.falsePositive}</p>
                <p className="text-xs text-muted-foreground">False Positive</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Tabs value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
              <TabsTrigger value="removal_pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="removed">Removed ({stats.removed})</TabsTrigger>
              <TabsTrigger value="disputed">Disputed ({stats.disputed})</TabsTrigger>
              <TabsTrigger value="false_positive">False ({stats.falsePositive})</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Matches List */}
        <div className="space-y-4">
          {filteredMatches.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">No Matches Found</h3>
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? "You're all clear! No matches detected." 
                    : `No matches match the "${filter}" filter. Try adjusting your filters.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredMatches.map((match) => {
              const risk = riskLevel(match.risk_score || 0);
              const StatusIcon = statusConfig[match.status as keyof typeof statusConfig]?.icon || AlertCircle;
              
              return (
                <Card
                  key={match.id}
                  className={cn(
                    'border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
                    'hover:border-primary/30'
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                          <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg">{match.source || match.source_name || 'Unknown Source'}</h3>
                            <Badge className={cn('text-xs', risk.bg, risk.color, risk.border)}>
                              {risk.label}
                            </Badge>
                            <Badge className={cn('text-xs', statusConfig[match.status as keyof typeof statusConfig]?.color)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[match.status as keyof typeof statusConfig]?.label || match.status}
                            </Badge>
                          </div>
                          {match.url && (
                            <a
                              href={match.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1 mb-3"
                            >
                              {match.url}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          
                          {/* Detected Fields */}
                          {match.detected_fields && match.detected_fields.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {match.detected_fields.map((field: string) => {
                                const Icon = fieldIcons[field] || User;
                                return (
                                  <Badge
                                    key={field}
                                    variant="outline"
                                    className="text-xs bg-primary/5 border-primary/20"
                                  >
                                    <Icon className="h-3 w-3 mr-1" />
                                    {field}
                                  </Badge>
                                );
                              })}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-6 text-xs text-muted-foreground">
                            <span>Confidence: {match.confidence_score || 0}%</span>
                            <span>Last seen: {new Date(match.updated_at || match.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <div className="text-3xl font-bold mb-1" style={{ color: `hsl(${360 - (match.risk_score || 0) * 1.2}, 70%, 50%)` }}>
                          {match.risk_score || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">Risk Score</p>
                        {match.status === 'active' && (
                          <Button size="sm" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Risk Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>Risk Level</span>
                        <span>{match.risk_score || 0}%</span>
                      </div>
                      <Progress
                        value={match.risk_score || 0}
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
