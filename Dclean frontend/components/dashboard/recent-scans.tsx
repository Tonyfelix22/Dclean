'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ExternalLink, Eye, Shield, RefreshCw, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';

const statusColors = {
  completed: 'bg-success text-success-foreground',
  running: 'bg-info text-info-foreground',
  failed: 'bg-destructive text-destructive-foreground',
  pending: 'bg-muted text-muted-foreground',
  cancelled: 'bg-muted text-muted-foreground',
};

const riskColor = (risk: number) => {
  if (risk >= 80) return 'text-destructive';
  if (risk >= 50) return 'text-warning';
  return 'text-success';
};

export function RecentScans() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchScans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.listScans({ page_size: 5 });
      setScans(response.results || []);
    } catch (err: any) {
      // Only log unexpected errors, not expected auth errors
      if (err?.code !== 'HTTP_401' && err?.details?.code !== 'token_expired') {
        console.error('Failed to fetch recent scans:', err);
      }
      setError(err?.message || 'Failed to load scans');
      setScans([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchScans();
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-sm text-muted-foreground">Loading recent scans...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="py-6 text-center">
          <p className="text-sm text-destructive mb-3">{error}</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 hover:border-primary/20 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Recent Scans</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {scans.length === 0 ? 'No scans yet' : `${scans.length} most recent scans`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/scans">
                View All
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {scans.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-semibold mb-1">No Scans Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Start your first scan to see results here</p>
            <Button asChild className="bg-gradient-to-r from-primary to-secondary">
              <a href="/scans">Start a Scan</a>
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Source</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scans.map((scan) => (
                  <TableRow key={scan.id} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                          <Shield className="h-4 w-4 text-primary" />
                        </div>
                        Scan #{scan.id.slice(0, 8)}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(scan.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-medium capitalize">
                        {scan.scan_type || 'full'}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-32">
                      {scan.status === 'running' ? (
                        <div className="space-y-1">
                          <Progress value={scan.progress || 0} className="h-2" />
                          <p className="text-xs text-muted-foreground">{scan.progress || 0}%</p>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {scan.progress || 0}%
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', statusColors[scan.status] || statusColors.pending)}>
                        {scan.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/matches`}>
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
