'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { CleaningRule } from '@/lib/api.types';
import { Trash2, Edit2, Play } from 'lucide-react';

interface RulesListProps {
  rules: CleaningRule[];
  onEdit: (rule: CleaningRule) => void;
  onDelete: (ruleId: string) => void;
  onTest: (rule: CleaningRule) => void;
  onToggle: (ruleId: string, enabled: boolean) => void;
  loading?: boolean;
}

export function RulesList({
  rules,
  onEdit,
  onDelete,
  onTest,
  onToggle,
  loading = false,
}: RulesListProps) {
  if (rules.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground mb-4">No rules created yet.</p>
        <Button onClick={() => onEdit({} as CleaningRule)}>
          Create Your First Rule
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {rules.map((rule) => (
        <Card key={rule.id} className="p-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-start gap-4">
            <Checkbox
              checked={rule.enabled}
              onCheckedChange={(checked) =>
                onToggle(rule.id, checked as boolean)
              }
              disabled={loading}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground truncate">
                    {rule.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {rule.description}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
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

              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  <span className="font-medium">Pattern:</span>{' '}
                  <code className="bg-muted px-2 py-1 rounded">
                    {rule.pattern}
                  </code>
                </p>
                <p>
                  <span className="font-medium">Type:</span> {rule.patternType} •{' '}
                  <span className="font-medium">Match:</span> {rule.matchType}
                </p>
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTest(rule)}
                disabled={loading}
                title="Test pattern"
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(rule)}
                disabled={loading}
                title="Edit rule"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(rule.id)}
                disabled={loading}
                className="text-destructive hover:text-destructive"
                title="Delete rule"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
