'use client';

import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  Mail,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  Trash2,
  Eye,
  Settings,
  Scan,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const typeConfig: Record<string, { icon: any; color: string; gradient: string }> = {
  scan_complete: {
    icon: Scan,
    color: 'from-primary to-cyan-400',
    bgColor: 'bg-primary/10',
  },
  new_match: {
    icon: AlertTriangle,
    color: 'from-destructive to-red-400',
    bgColor: 'bg-destructive/10',
  },
  removal_update: {
    icon: CheckCircle,
    color: 'from-success to-emerald-400',
    bgColor: 'bg-success/10',
  },
  reappearance: {
    icon: Eye,
    color: 'from-warning to-amber-400',
    bgColor: 'bg-warning/10',
  },
  identity_verified: {
    icon: Shield,
    color: 'from-secondary to-purple-400',
    bgColor: 'bg-secondary/10',
  },
  system: {
    icon: Bell,
    color: 'from-muted to-muted',
    bgColor: 'bg-muted/10',
  },
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [notificationsResponse, preferencesResponse] = await Promise.all([
        apiClient.listNotifications({ page_size: 50 }).catch(() => ({ results: [] })),
        apiClient.getNotificationPreferences().catch(() => null),
      ]);

      setNotifications(notificationsResponse.results || []);
      setPreferences(preferencesResponse);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications.');
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

  const handleMarkAllRead = async () => {
    try {
      await apiClient.markAllNotificationsRead();
      await fetchData();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await apiClient.markNotificationRead(id);
      await fetchData();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <MainLayout pageTitle="Notifications" pageSubtitle="Loading notifications...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading your notifications...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      pageTitle="Notifications"
      pageSubtitle="Stay updated on your privacy status"
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

        {/* Notifications Overview */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary animate-pulse-glow">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Notification Center</h3>
                  <p className="text-sm text-muted-foreground">
                    {unreadCount} unread notifications
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
                  Refresh
                </Button>
                {unreadCount > 0 && (
                  <Button onClick={handleMarkAllRead} variant="outline" size="sm">
                    Mark All Read
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl bg-primary/10">
                <p className="text-3xl font-bold text-primary">{unreadCount}</p>
                <p className="text-xs text-muted-foreground">Unread</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-destructive/10">
                <p className="text-3xl font-bold text-destructive">
                  {notifications.filter(n => n.type === 'new_match').length}
                </p>
                <p className="text-xs text-muted-foreground">New Matches</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-success/10">
                <p className="text-3xl font-bold text-success">
                  {notifications.filter(n => n.type === 'removal_update' || n.type === 'removal_update').length}
                </p>
                <p className="text-xs text-muted-foreground">Removals</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-warning/10">
                <p className="text-3xl font-bold text-warning">
                  {notifications.filter(n => n.type === 'reappearance').length}
                </p>
                <p className="text-xs text-muted-foreground">Reappearances</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inbox">
              Inbox
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="mt-6">
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="p-12 text-center">
                    <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-bold mb-2">No Notifications</h3>
                    <p className="text-muted-foreground">
                      You're all caught up! Notifications will appear here when there are updates.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                notifications.map((notification) => {
                  const Icon = typeConfig[notification.type]?.icon || Bell;
                  const config = typeConfig[notification.type] || typeConfig.system;
                  
                  return (
                    <Card
                      key={notification.id}
                      className={cn(
                        'border-border/50 transition-all duration-300 hover:shadow-lg',
                        !notification.is_read && 'border-primary/30 bg-primary/5'
                      )}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'p-3 rounded-xl bg-gradient-to-br',
                            config.color
                          )}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold">{notification.title}</h3>
                              {!notification.is_read && (
                                <Badge variant="destructive" className="text-xs">New</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(notification.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {notification.action_url && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={notification.action_url}>
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            {!notification.is_read && (
                              <Button size="sm" variant="outline" onClick={() => handleMarkRead(notification.id)}>
                                Mark Read
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Channels</h3>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences?.email_enabled ?? true}
                      onCheckedChange={async (checked) => {
                        try {
                          await apiClient.updateNotificationPreferences({ email_enabled: checked });
                          await fetchData();
                        } catch (err) {
                          console.error('Failed to update preferences:', err);
                        }
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">In-App Notifications</p>
                        <p className="text-sm text-muted-foreground">Show alerts in dashboard</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences?.in_app_enabled ?? true}
                      onCheckedChange={async (checked) => {
                        try {
                          await apiClient.updateNotificationPreferences({ in_app_enabled: checked });
                          await fetchData();
                        } catch (err) {
                          console.error('Failed to update preferences:', err);
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className="space-y-4 pt-6 border-t border-border">
                  <h3 className="font-semibold">Alert Types</h3>
                  
                  {[
                    { key: 'scan_alerts', label: 'Scan Complete Alerts', desc: 'Notify when scans finish', prefKey: 'scan_alerts' },
                    { key: 'removal_updates', label: 'Removal Updates', desc: 'Track removal request status', prefKey: 'removal_updates' },
                    { key: 'new_match_alerts', label: 'New Match Alerts', desc: 'Alert when new matches found', prefKey: 'new_match_alerts' },
                    { key: 'reappearance_alerts', label: 'Reappearance Alerts', desc: 'Warn when data reappears', prefKey: 'reappearance_alerts' },
                    { key: 'weekly_digest', label: 'Weekly Digest', desc: 'Summary of privacy activity', prefKey: 'weekly_digest' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={preferences?.[item.prefKey] ?? true}
                        onCheckedChange={async (checked) => {
                          try {
                            await apiClient.updateNotificationPreferences({ [item.prefKey]: checked });
                            await fetchData();
                          } catch (err) {
                            console.error('Failed to update preferences:', err);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
