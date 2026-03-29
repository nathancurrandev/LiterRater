import { useCallback, useEffect, useState } from 'react';
import { api } from '@/services/apiClient';
import type { ReadingEntry, BookSummary, PaginationMeta } from '@/types';

type ReadingEntryWithBook = ReadingEntry & { book: BookSummary };

interface CreateData {
  bookId: number;
  status: 'reading' | 'finished' | 'abandoned';
  startDate?: string | null;
  finishDate?: string | null;
  isReread?: boolean;
  notes?: string | null;
}

type UpdateData = Partial<Omit<CreateData, 'bookId'>>;

export function useReadingEntries(filters?: {
  bookId?: number;
  status?: 'reading' | 'finished' | 'abandoned';
  page?: number;
}) {
  const [entries, setEntries] = useState<ReadingEntryWithBook[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.bookId !== undefined) params.set('bookId', String(filters.bookId));
      if (filters?.status) params.set('status', filters.status);
      if (filters?.page) params.set('page', String(filters.page));
      const qs = params.toString();
      const res = await api.get<{ data: ReadingEntryWithBook[]; meta: PaginationMeta }>(
        `/api/reading-entries${qs ? `?${qs}` : ''}`,
      );
      setEntries(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reading diary');
    } finally {
      setIsLoading(false);
    }
  }, [filters?.bookId, filters?.status, filters?.page]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(async (data: CreateData): Promise<ReadingEntry> => {
    const entry = await api.post<ReadingEntry>('/api/reading-entries', data);
    await load();
    return entry;
  }, [load]);

  const update = useCallback(async (id: number, data: UpdateData): Promise<ReadingEntry> => {
    const entry = await api.patch<ReadingEntry>(`/api/reading-entries/${id}`, data);
    await load();
    return entry;
  }, [load]);

  const remove = useCallback(async (id: number): Promise<void> => {
    await api.del(`/api/reading-entries/${id}`);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { entries, meta, isLoading, error, create, update, remove, reload: load };
}
