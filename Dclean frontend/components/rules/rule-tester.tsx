'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { CleaningRule, RuleTestResponse } from '@/lib/api.types';
import { apiClient } from '@/lib/api-client';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle2, XCircle } from 'lucide-react';

interface RuleTesterProps {
  rule: CleaningRule;
  onClose: () => void;
}

export function RuleTester({ rule, onClose }: RuleTesterProps) {
  const [testInput, setTestInput] = useState('');
  const [results, setResults] = useState<RuleTestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!testInput.trim()) {
      setError('Please enter test cases');
      return;
    }

    const testCases = testInput
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.testRule({
        pattern: rule.pattern,
        patternType: rule.patternType,
        matchType: rule.matchType,
        testCases,
      });
      setResults(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test rule');
    } finally {
      setLoading(false);
    }
  };

  const matchCount = results
    ? results.matches.filter((m) => m.matched).length
    : 0;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Test Rule: {rule.name}</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            Test Cases (one per line)
          </label>
          <Textarea
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="file.tmp&#10;document.docx&#10;image.jpg"
            rows={6}
            disabled={loading}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Enter file names or paths to test against the pattern
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button
          onClick={handleTest}
          disabled={loading}
          className="w-full gap-2"
        >
          {loading && <Spinner className="h-4 w-4" />}
          Test Pattern
        </Button>

        {results && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium text-foreground">
                Matches: {matchCount} of {results.matches.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {((matchCount / results.matches.length) * 100).toFixed(0)}%
              </span>
            </div>

            <div className="space-y-2">
              {results.matches.map((match, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                >
                  {match.matched ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span
                    className={`font-mono text-sm flex-1 ${
                      match.matched
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {match.testCase}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {match.matched ? 'MATCH' : 'NO MATCH'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </Card>
  );
}
