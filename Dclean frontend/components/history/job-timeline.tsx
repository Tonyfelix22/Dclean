'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { JobHistory } from '@/lib/api.types';
import { formatBytes } from '@/lib/utils';
import { RotateCcw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface JobTimelineProps {
  jobs: JobHistory[];
  onRestore: (jobId: string) => void;
  onDelete: (jobId: string) => void;
  loading?: boolean;
}

export function JobTimeline({
  jobs,
  onRestore,
  onDelete,
  loading = false,
}: JobTimelineProps) {
  if (jobs.length === 0) {
    return (
      <Card className="p-12 text-center text-muted-foreground">
        No jobs in history yet. Run a scan to get started.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job, idx) => (
        <div key={job.id} className="relative">
          {idx < jobs.length - 1 && (
            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
          )}

          <Card className="p-4 relative">
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div
                  className={`w-4 h-4 rounded-full border-2 border-border relative z-10 ${
                    job.type === 'scan'
                      ? 'bg-primary'
                      : job.type === 'clean'
                        ? 'bg-green-500'
                        : 'bg-muted'
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground capitalize">
                      {job.type} Job - {job.id.slice(0, 8)}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(job.createdAt), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                      job.job.status === 'completed'
                        ? 'bg-green-500/20 text-green-500'
                        : job.job.status === 'error'
                          ? 'bg-destructive/20 text-destructive'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {job.job.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                  <div className="bg-muted rounded p-2">
                    <p className="text-xs text-muted-foreground">Results</p>
                    <p className="font-medium text-foreground">
                      {job.resultsCount}
                    </p>
                  </div>
                  <div className="bg-muted rounded p-2">
                    <p className="text-xs text-muted-foreground">Size</p>
                    <p className="font-medium text-foreground">
                      {formatBytes(job.job.sizeFound)}
                    </p>
                  </div>
                  <div className="bg-muted rounded p-2">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-medium text-foreground">
                      {job.job.completedAt
                        ? `${Math.round(
                            (new Date(job.job.completedAt).getTime() -
                              new Date(job.job.createdAt).getTime()) /
                              1000
                          )}s`
                        : '-'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {job.canRestore && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRestore(job.id)}
                      disabled={loading}
                      className="gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Restore
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(job.id)}
                    disabled={loading}
                    className="gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
