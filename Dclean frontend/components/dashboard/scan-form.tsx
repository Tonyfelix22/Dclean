'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import type { CleaningRule } from '@/lib/api.types';
import { Spinner } from '@/components/ui/spinner';

interface ScanFormProps {
  rules: CleaningRule[];
  onScanStart: (jobId: string) => void;
  onError: (error: string) => void;
}

export function ScanForm({ rules, onScanStart, onError }: ScanFormProps) {
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [includeHidden, setIncludeHidden] = useState(false);
  const [maxDepth, setMaxDepth] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleStartScan = async () => {
    try {
      setLoading(true);
      const job = await apiClient.startScan({
        ruleIds: selectedRules.length > 0 ? selectedRules : undefined,
        includeHiddenFiles: includeHidden,
        maxDepth,
      });
      onScanStart(job.id);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to start scan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Start New Scan</h2>
        <p className="text-muted-foreground">
          Configure and run a new scanning job to find files matching your rules.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Select Rules
          </h3>
          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No rules available. Create a rule first in the Rules section.
            </p>
          ) : (
            <div className="space-y-2">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center gap-2">
                  <Checkbox
                    id={rule.id}
                    checked={selectedRules.includes(rule.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRules([...selectedRules, rule.id]);
                      } else {
                        setSelectedRules(
                          selectedRules.filter((id) => id !== rule.id)
                        );
                      }
                    }}
                  />
                  <label
                    htmlFor={rule.id}
                    className="flex-1 text-sm font-medium cursor-pointer"
                  >
                    <span className="text-foreground">{rule.name}</span>
                    <span className="text-muted-foreground ml-2">
                      {rule.description}
                    </span>
                  </label>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      rule.riskLevel === 'high'
                        ? 'bg-destructive/20 text-destructive'
                        : rule.riskLevel === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-green-500/20 text-green-500'
                    }`}
                  >
                    {rule.riskLevel}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border pt-4 space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="include-hidden"
              checked={includeHidden}
              onCheckedChange={(checked) => setIncludeHidden(checked as boolean)}
            />
            <label
              htmlFor="include-hidden"
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              Include hidden files and folders
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="max-depth"
              className="text-sm font-medium text-foreground"
            >
              Search depth (levels)
            </label>
            <Input
              id="max-depth"
              type="number"
              value={maxDepth}
              onChange={(e) => setMaxDepth(parseInt(e.target.value) || 0)}
              min={1}
              max={50}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              Higher values search deeper into directories (default: 10)
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          size="lg"
          onClick={handleStartScan}
          disabled={loading}
          className="gap-2"
        >
          {loading && <Spinner className="h-4 w-4" />}
          {loading ? 'Starting scan...' : 'Start Scan'}
        </Button>
        <Button size="lg" variant="outline" disabled={loading}>
          Save as Template
        </Button>
      </div>
    </Card>
  );
}
