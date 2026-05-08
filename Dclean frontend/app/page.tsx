'use client';

import { useEffect, useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { StatCard } from '@/components/dashboard/stat-card';
import { RecentScans } from '@/components/dashboard/recent-scans';
import { RiskChart } from '@/components/dashboard/risk-chart';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, TrendingDown, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

interface DashboardStats {
  total_scans: number;
  total_matches: number;
  total_removals: number;
  active_removals: number;
  risk_score: number;
  recent_scans: any[];
  recent_matches: any[];
  recent_activity: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch scans, matches, and removals in parallel
      const [scansResponse, matchesResponse, removalsResponse] = await Promise.all([
        apiClient.listScans({ page_size: 5 }).catch(() => ({ results: [], count: 0 })),
        apiClient.listMatches({ page_size: 5 }).catch(() => ({ results: [], count: 0 })),
        apiClient.listRemovals({ page_size: 10 }).catch(() => ({ results: [], count: 0 })),
      ]);

      const recentScans = scansResponse.results || [];
      const recentMatches = matchesResponse.results || [];
      const allRemovals = removalsResponse.results || [];
      const activeRemovals = allRemovals.filter((r: any) => 
        ['pending', 'in_progress', 'submitted'].includes(r.status)
      );

      // Calculate stats
      const totalScans = scansResponse.count || recentScans.length;
      const totalMatches = matchesResponse.count || recentMatches.length;
      const totalRemovals = allRemovals.length;
      
      // Calculate average risk score
      const avgRisk = recentMatches.length > 0
        ? Math.round(recentMatches.reduce((sum: number, m: any) => sum + (m.risk_score || 0), 0) / recentMatches.length)
        : 0;

      setStats({
        total_scans: totalScans,
        total_matches: totalMatches,
        total_removals: totalRemovals,
        active_removals: activeRemovals.length,
        risk_score: avgRisk,
        recent_scans: recentScans,
        recent_matches: recentMatches,
        recent_activity: [], // Will be populated from matches/removals
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <MainLayout pageTitle="Dashboard" pageSubtitle="Loading your privacy data...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading your privacy dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout pageTitle="Dashboard" pageSubtitle="Error loading data">
        <Card className="border-destructive/30">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  const statsData = [
    {
      title: 'Total Scans',
      value: stats?.total_scans || 0,
      change: stats ? `${stats.recent_scans.length} recent` : 'No data',
      changeType: 'positive' as const,
      icon: Shield,
      gradient: 'from-primary to-cyan-400',
    },
    {
      title: 'Matches Found',
      value: stats?.total_matches || 0,
      change: stats?.total_matches === 0 ? 'Great job!' : 'Review needed',
      changeType: (stats?.total_matches || 0) === 0 ? 'positive' : 'negative' as const,
      icon: AlertTriangle,
      gradient: 'from-accent to-pink-400',
    },
    {
      title: 'Data Removed',
      value: stats?.total_removals || 0,
      change: stats && stats.total_removals > 0
        ? `${Math.round((stats.total_removals / Math.max(stats.total_matches, 1)) * 100)}% success`
        : 'No removals yet',
      changeType: 'positive' as const,
      icon: TrendingDown,
      gradient: 'from-secondary to-purple-400',
    },
    {
      title: 'Active Removals',
      value: stats?.active_removals || 0,
      change: stats?.active_removals === 0 ? 'All clear!' : 'In progress',
      changeType: (stats?.active_removals || 0) === 0 ? 'positive' : 'neutral' as const,
      icon: CheckCircle2,
      gradient: 'from-success to-emerald-400',
    },
  ];

  return (
    <MainLayout
      pageTitle="Dashboard"
      pageSubtitle="Monitor your privacy protection status"
    >
      <div className="space-y-8">
        {/* Quick Actions */}
        <QuickActions />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RiskChart />
          </div>

          {/* Activity Feed - Takes 1 column */}
          <div className="lg:col-span-1">
            <ActivityFeed />
          </div>
        </div>

        {/* Recent Scans */}
        <RecentScans />
      </div>
    </MainLayout>
  );
}
