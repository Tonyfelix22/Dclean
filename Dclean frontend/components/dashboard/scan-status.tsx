'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ScanJob } from '@/lib/api.types';
import { formatBytes } from '@/lib/utils';
import { X } from 'lucide-react';

interface ScanStatusProps {
  job: ScanJob;
  onCancel: () => void;
  onContinue: () => void;
}

export function ScanStatus({ job, onCancel, onContinue }: ScanStatusProps) {
  const isRunning = job.status === 'scanning' || job.status === 'queued';
  const isCompleted = job.status === 'completed';
  const isError = job.status === 'error';

  const statusColor =
    job.status === 'completed'
      ? 'text-green-500'
      : job.status === 'error'
        ? 'text-destructive'
        : job.status === 'cancelled'
          ? 'text-muted-foreground'
          : 'text-primary';

  const statusBgColor =
    job.status === 'completed'
      ? 'bg-green-500/20'
      : job.status === 'error'
        ? 'bg-destructive/20'
        : job.status === 'cancelled'
          ? 'bg-muted'
          : 'bg-primary/20';

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {isRunning ? 'Scanning in Progress' : 'Scan Complete'}
          </h2>
          <p className="text-muted-foreground">
            Job ID: {job.id}
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${statusBgColor} ${statusColor}`}
        >
          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </div>
      </div>

      {isRunning && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground font-medium">Progress</span>
              <span className="text-muted-foreground">{job.progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${job.progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Files Found</p>
          <p className="text-2xl font-bold text-foreground">
            {job.filesFound.toLocaleString()}
          </p>
        </div>
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Size</p>
          <p className="text-2xl font-bold text-foreground">
            {formatBytes(job.sizeFound)}
          </p>
        </div>
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Directories</p>
          <p className="text-2xl font-bold text-foreground">
            {job.directoriesScanned.toLocaleString()}
          </p>
        </div>
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Duration</p>
          <p className="text-2xl font-bold text-foreground">
            {job.completedAt
              ? `${Math.round(
                  (new Date(job.completedAt).getTime() -
                    new Date(job.createdAt).getTime()) /
                    1000
                )}s`
              : 'Running...'}
          </p>
        </div>
      </div>

      {isError && job.error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <p className="text-sm font-medium text-destructive mb-1">Error</p>
          <p className="text-sm text-destructive/80">{job.error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        {isRunning && (
          <Button
            size="lg"
            variant="outline"
            onClick={onCancel}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cancel Scan
          </Button>
        )}
        {isCompleted && (
          <Button size="lg" onClick={onContinue}>
            Review Results
          </Button>
        )}
      </div>
    </Card>
  );
}
