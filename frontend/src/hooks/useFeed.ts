import { useCallback, useEffect, useState } from 'react';
import { api } from '@/services/apiClient';
import type { ActivityEvent, PaginationMeta } from '@/types';

export function useFeed(page = 1) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getRaw<{ data: ActivityEvent[]; meta: PaginationMeta }>(
        `/api/feed?page=${page}`,
      );
      setEvents(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  return { events, meta, isLoading, error };
}
