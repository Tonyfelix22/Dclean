'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CleaningRule } from '@/lib/api.types';
import { Spinner } from '@/components/ui/spinner';
import { X } from 'lucide-react';

interface RuleFormProps {
  rule?: CleaningRule;
  onSubmit: (rule: Omit<CleaningRule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function RuleForm({
  rule,
  onSubmit,
  onCancel,
  loading = false,
}: RuleFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pattern: '',
    patternType: 'glob' as const,
    matchType: 'name' as const,
    action: 'delete' as const,
    riskLevel: 'medium' as const,
    enabled: true,
  });

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name,
        description: rule.description,
        pattern: rule.pattern,
        patternType: rule.patternType,
        matchType: rule.matchType,
        action: rule.action,
        riskLevel: rule.riskLevel,
        enabled: rule.enabled,
      });
    }
  }, [rule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (err) {
      // Error handled by parent
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">
            {rule ? 'Edit Rule' : 'Create New Rule'}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium text-foreground block mb-2">
              Rule Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Temporary Files"
              disabled={loading}
              required
            />
          </div>

          <div className="col-span-2">
            <label className="text-sm font-medium text-foreground block mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="What does this rule do?"
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="col-span-2">
            <label className="text-sm font-medium text-foreground block mb-2">
              Pattern
            </label>
            <Input
              value={formData.pattern}
              onChange={(e) =>
                setFormData({ ...formData, pattern: e.target.value })
              }
              placeholder="e.g., *.tmp or ^~.*"
              disabled={loading}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use glob patterns (*.tmp) or regex patterns
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Pattern Type
            </label>
            <Select
              value={formData.patternType}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  patternType: value as 'glob' | 'regex',
                })
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="glob">Glob Pattern</SelectItem>
                <SelectItem value="regex">Regular Expression</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Match Type
            </label>
            <Select
              value={formData.matchType}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  matchType: value as 'name' | 'extension' | 'path',
                })
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">File Name</SelectItem>
                <SelectItem value="extension">Extension</SelectItem>
                <SelectItem value="path">Full Path</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Action
            </label>
            <Select
              value={formData.action}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  action: value as 'delete' | 'archive',
                })
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="archive">Archive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Risk Level
            </label>
            <Select
              value={formData.riskLevel}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  riskLevel: value as 'low' | 'medium' | 'high',
                })
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Higher risk rules require more confirmation
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading && <Spinner className="h-4 w-4" />}
            {rule ? 'Update Rule' : 'Create Rule'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
