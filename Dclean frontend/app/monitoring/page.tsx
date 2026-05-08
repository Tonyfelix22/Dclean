'use client';

import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Calendar,
  Clock,
  Bell,
  Shield,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const eventTypeConfig: Record<string, { label: string; icon: any; color: string; gradient: string }> = {
  new_match: {
    label: 'New Match',
    icon: AlertTriangle,
    color: 'bg-destructive text-destructive-foreground',
    gradient: 'from-destructive to-red-400',
  },
  reappearance: {
    label: 'Reappearance',
    icon: Eye,
    color: 'bg-warning text-warning-foreground',
    gradient: 'from-warning to-amber-400',
  },
  removal_confirmed: {
    label: 'Removal Confirmed',
    icon: CheckCircle2,
    color: 'bg-success text-success-foreground',
    gradient: 'from-success to-emerald-400',
  },
  score_change: {
    label: 'Score Change',
    icon: TrendingDown,
    color: 'bg-info text-info-foreground',
    gradient: 'from-info to-blue-400',
  },
};

const frequencyConfig: Record<string, { label: string; icon: any; color: string }> = {
  daily: { label: 'Daily', icon: Calendar, color: 'text-primary' },
  weekly: { label: 'Weekly', icon: Calendar, color: 'text-secondary' },
  monthly: { label: 'Monthly', icon: Calendar, color: 'text-accent' },
};

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState('plans');
  const [plans, setPlans] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [plansResponse, eventsResponse] = await Promise.all([
        apiClient.listMonitoringPlans().catch(() => []),
        apiClient.listMonitoringEvents({ page_size: 20 }).catch(() => ({ results: [] })),
      ]);

      setPlans(plansResponse || []);
      setEvents(eventsResponse.results || []);
    } catch (err) {
      console.error('Failed to fetch monitoring data:', err);
      setError('Failed to load monitoring data. Make sure the backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const getNextRunDate = (dateString: string) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unacknowledgedCount = events.filter(e => !e.acknowledged).length;

  if (loading) {
    return (
      <MainLayout pageTitle="Monitoring" pageSubtitle="Loading monitoring data...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading your monitoring schedules...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      pageTitle="Monitoring"
      pageSubtitle="Automated privacy scanning schedule"
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

        {/* Monitoring Overview Banner */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary animate-pulse-glow">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Monitoring Overview</h3>
                  <p className="text-sm text-muted-foreground">
                    {plans.length} active schedules | {unacknowledgedCount} unacknowledged events
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
                  Refresh
                </Button>
                <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Schedule
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Active Plans</p>
                </div>
                <p className="text-3xl font-bold text-primary">{plans.length}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-success/10 to-success/5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <p className="text-sm text-muted-foreground">Scans Completed</p>
                </div>
                <p className="text-3xl font-bold text-success">{events.filter(e => e.event_type === 'removal_confirmed').length}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-accent" />
                  <p className="text-sm text-muted-foreground">New This Week</p>
                </div>
                <p className="text-3xl font-bold text-accent">{unacknowledgedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'plans' ? 'default' : 'outline'}
            onClick={() => setActiveTab('plans')}
            className={activeTab === 'plans' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
          >
            Monitoring Plans
          </Button>
          <Button
            variant={activeTab === 'events' ? 'default' : 'outline'}
            onClick={() => setActiveTab('events')}
            className={activeTab === 'events' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
          >
            Recent Events
            {unacknowledgedCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unacknowledgedCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Monitoring Plans */}
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plans.length === 0 ? (
              <Card className="border-border/50 lg:col-span-2">
                <CardContent className="p-12 text-center">
                  <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">No Monitoring Plans</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't set up any automated monitoring schedules yet.
                  </p>
                  <Button className="bg-gradient-to-r from-primary to-secondary">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Schedule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              plans.map((plan) => {
                const FreqIcon = frequencyConfig[plan.frequency]?.icon || Calendar;
                
                return (
                  <Card
                    key={plan.id}
                    className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'p-3 rounded-xl',
                            'bg-gradient-to-br from-primary/20 to-secondary/20'
                          )}>
                            <FreqIcon className={cn('h-6 w-6', frequencyConfig[plan.frequency]?.color || 'text-primary')} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{plan.name || `${plan.frequency} scan`}</CardTitle>
                            <CardDescription className="mt-1">
                              {plan.frequency?.charAt(0).toUpperCase() + plan.frequency?.slice(1)} monitoring
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-success text-success-foreground">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Next Run</p>
                          <p className="font-semibold">{getNextRunDate(plan.next_run_at)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Run</p>
                          <p className="font-semibold">{plan.last_run_at ? new Date(plan.last_run_at).toLocaleDateString() : 'Never'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Email Notifications</span>
                        </div>
                        <Switch checked={plan.email_notifications ?? true} />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">In-App Notifications</span>
                        </div>
                        <Switch checked={plan.in_app_notifications ?? true} />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Recent Events */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            {events.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="p-12 text-center">
                  <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">No Events Yet</h3>
                  <p className="text-muted-foreground">
                    Monitoring events will appear here when your automated scans detect changes.
                  </p>
                </CardContent>
              </Card>
            ) : (
              events.map((event) => {
                const EventIcon = eventTypeConfig[event.event_type]?.icon || Bell;
                const eventConfig = eventTypeConfig[event.event_type] || {
                  label: event.event_type,
                  icon: Bell,
                  color: 'bg-muted text-muted-foreground',
                  gradient: 'from-muted to-muted',
                };
                
                return (
                  <Card
                    key={event.id}
                    className={cn(
                      'border-border/50 transition-all duration-300 hover:shadow-lg',
                      !event.acknowledged && 'border-primary/30 bg-primary/5'
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'p-3 rounded-xl bg-gradient-to-br',
                          eventConfig.gradient
                        )}>
                          <EventIcon className="h-5 w-5 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold">{eventConfig.label}</h3>
                            {!event.acknowledged && (
                              <Badge variant="destructive" className="text-xs">New</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {event.description || event.details?.message || 'Event detected'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              {event.source || event.plan || 'Unknown source'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(event.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        {!event.acknowledged && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={async () => {
                              try {
                                await apiClient.acknowledgeEvent(event.id);
                                await fetchData();
                              } catch (err) {
                                console.error('Failed to acknowledge event:', err);
                              }
                            }}
                          >
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
