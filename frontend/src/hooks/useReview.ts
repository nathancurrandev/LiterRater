import { useCallback } from 'react';
import { api } from '@/services/apiClient';
import type { Review } from '@/types';

export function useReview(bookId: number) {
  const upsert = useCallback(
    async (data: { content: string; containsSpoilers: boolean }): Promise<Review> => {
      return api.post<Review>('/api/reviews', { bookId, ...data });
    },
    [bookId],
  );

  const remove = useCallback(async (): Promise<void> => {
    await api.del(`/api/reviews/${bookId}`);
  }, [bookId]);

  return { upsert, remove };
}
