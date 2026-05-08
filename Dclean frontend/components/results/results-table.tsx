'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { FileResult } from '@/lib/api.types';
import { formatBytes } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, ArrowUpDown } from 'lucide-react';

interface ResultsTableProps {
  results: FileResult[];
  loading?: boolean;
  onSelectionChange: (fileIds: string[]) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

type SortField = 'name' | 'size' | 'riskLevel';
type SortOrder = 'asc' | 'desc';

export function ResultsTable({
  results,
  loading = false,
  onSelectionChange,
  onLoadMore,
  hasMore = false,
}: ResultsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('riskLevel');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterRisk, setFilterRisk] = useState<string | null>(null);

  const toggleSelect = useCallback(
    (id: string) => {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      setSelectedIds(newSelected);
      onSelectionChange(Array.from(newSelected));
    },
    [selectedIds, onSelectionChange]
  );

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === results.length) {
      setSelectedIds(new Set());
      onSelectionChange([]);
    } else {
      const all = new Set(results.map((r) => r.id));
      setSelectedIds(all);
      onSelectionChange(Array.from(all));
    }
  }, [results, selectedIds, onSelectionChange]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (sortField === 'size') {
      aVal = a.size;
      bVal = b.size;
    } else if (sortField === 'riskLevel') {
      const riskOrder = { low: 0, medium: 1, high: 2 };
      aVal = riskOrder[a.riskLevel];
      bVal = riskOrder[b.riskLevel];
    }

    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const filteredResults = filterRisk
    ? sortedResults.filter((r) => r.riskLevel === filterRisk)
    : sortedResults;

  const riskCounts = {
    low: results.filter((r) => r.riskLevel === 'low').length,
    medium: results.filter((r) => r.riskLevel === 'medium').length,
    high: results.filter((r) => r.riskLevel === 'high').length,
  };

  return (
    <Card className="space-y-4">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Scan Results</h2>
          <div className="text-sm text-muted-foreground">
            {selectedIds.size} of {results.length} selected
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterRisk === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterRisk(null)}
          >
            All ({results.length})
          </Button>
          <Button
            variant={filterRisk === 'high' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterRisk('high')}
            className={filterRisk === 'high' ? 'bg-destructive text-destructive-foreground' : ''}
          >
            High Risk ({riskCounts.high})
          </Button>
          <Button
            variant={filterRisk === 'medium' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterRisk('medium')}
            className={filterRisk === 'medium' ? 'bg-yellow-600 text-white' : ''}
          >
            Medium Risk ({riskCounts.medium})
          </Button>
          <Button
            variant={filterRisk === 'low' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterRisk('low')}
            className={filterRisk === 'low' ? 'bg-green-600 text-white' : ''}
          >
            Low Risk ({riskCounts.low})
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left">
                <Checkbox
                  checked={selectedIds.size === filteredResults.length && filteredResults.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort('name')}
                >
                  Name <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort('size')}
                >
                  Size <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort('riskLevel')}
                >
                  Risk <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                Reason
              </th>
              <th className="px-6 py-3 text-left" />
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((result) => (
              <tr
                key={result.id}
                className="border-b border-border hover:bg-muted transition-colors"
              >
                <td className="px-6 py-3">
                  <Checkbox
                    checked={selectedIds.has(result.id)}
                    onCheckedChange={() => toggleSelect(result.id)}
                  />
                </td>
                <td className="px-6 py-3">
                  <div>
                    <p className="font-medium text-foreground truncate">
                      {result.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {result.path}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-3 text-foreground">
                  {formatBytes(result.size)}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      result.riskLevel === 'high'
                        ? 'bg-destructive/20 text-destructive'
                        : result.riskLevel === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-green-500/20 text-green-500'
                    }`}
                  >
                    {result.riskLevel}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-muted-foreground max-w-xs truncate">
                  {result.reason}
                </td>
                <td className="px-6 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Open Location</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="p-6 border-t border-border flex justify-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Results'}
          </Button>
        </div>
      )}

      {filteredResults.length === 0 && (
        <div className="p-12 text-center text-muted-foreground">
          No results found
        </div>
      )}
    </Card>
  );
}
