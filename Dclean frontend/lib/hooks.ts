'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ScanJob, CleanJob, FileResult, CleaningRule, User } from './api.types';
import { apiClient } from './api-client';

// Hook for polling job status
export function useJobPolling(jobId: string | null, type: 'scan' | 'clean' = 'scan') {
  const [job, setJob] = useState<ScanJob | CleanJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!jobId) return;

    let interval: NodeJS.Timeout;
    let isMounted = true;

    const pollStatus = async () => {
      try {
        setLoading(true);
        const updatedJob = type === 'scan'
          ? await apiClient.getScanStatus(jobId)
          : await apiClient.getCleanStatus(jobId);

        if (isMounted) {
          setJob(updatedJob);
          setError(null);

          // Stop polling if job is complete or errored
          if (updatedJob.status === 'completed' || updatedJob.status === 'error') {
            clearInterval(interval);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch job status');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Poll immediately and then every 2 seconds
    pollStatus();
    interval = setInterval(pollStatus, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [jobId, type]);

  const cancel = useCallback(async () => {
    if (!jobId) return;
    try {
      await apiClient.cancelScan(jobId);
      if (job && 'status' in job) {
        setJob({ ...job, status: 'cancelled' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel job');
    }
  }, [jobId, job]);

  return { job, loading, error, cancel };
}

// Hook for fetching paginated results
export function useScanResults(jobId: string | null, pageSize = 50) {
  const [results, setResults] = useState<FileResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchResults = useCallback(
    async (skip: number) => {
      if (!jobId) return;
      try {
        setLoading(true);
        const data = await apiClient.getScanResults(jobId, skip, pageSize);
        setResults(data);
        // Note: Backend should return total count header or separate endpoint
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch results');
      } finally {
        setLoading(false);
      }
    },
    [jobId, pageSize]
  );

  return { results, loading, error, totalCount, fetchResults };
}

// Hook for rules management
export function useRules() {
  const [rules, setRules] = useState<CleaningRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.listRules();
      setRules(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rules');
    } finally {
      setLoading(false);
    }
  }, []);

  const createRule = useCallback(
    async (rule: Omit<CleaningRule, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const newRule = await apiClient.createRule(rule);
        setRules([...rules, newRule]);
        return newRule;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create rule';
        setError(message);
        throw err;
      }
    },
    [rules]
  );

  const updateRule = useCallback(
    async (ruleId: string, updates: Partial<CleaningRule>) => {
      try {
        const updated = await apiClient.updateRule(ruleId, updates);
        setRules(rules.map(r => (r.id === ruleId ? updated : r)));
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update rule';
        setError(message);
        throw err;
      }
    },
    [rules]
  );

  const deleteRule = useCallback(
    async (ruleId: string) => {
      try {
        await apiClient.deleteRule(ruleId);
        setRules(rules.filter(r => r.id !== ruleId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete rule';
        setError(message);
        throw err;
      }
    },
    [rules]
  );

  return {
    rules,
    loading,
    error,
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
  };
}

// Hook for user profile
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCurrentUser();
      setUser(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(
    async (preferences: Partial<User['preferences']>) => {
      try {
        const updated = await apiClient.updateUserPreferences(preferences);
        setUser(updated);
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update preferences';
        setError(message);
        throw err;
      }
    },
    []
  );

  return { user, loading, error, fetchUser, updatePreferences };
}
