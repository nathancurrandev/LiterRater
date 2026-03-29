import { useCallback } from 'react';
import { api } from '@/services/apiClient';
import type { ListSummary, ListDetail } from '@/types';

interface CreateListData {
  title: string;
  description: string | null;
  isRanked: boolean;
  visibility: 'public' | 'private';
}

interface UpdateListData extends Partial<CreateListData> {}

export function useList() {
  const create = useCallback(async (data: CreateListData): Promise<ListSummary> => {
    return api.post<ListSummary>('/api/lists', data);
  }, []);

  const update = useCallback(async (listId: number, data: UpdateListData): Promise<ListDetail> => {
    return api.patch<ListDetail>(`/api/lists/${listId}`, data);
  }, []);

  const addItem = useCallback(
    async (listId: number, bookId: number, position?: number | null, notes?: string | null): Promise<void> => {
      await api.post(`/api/lists/${listId}/items`, { bookId, position, notes });
    },
    [],
  );

  const updateItem = useCallback(
    async (listId: number, bookId: number, data: { position?: number | null; notes?: string | null }): Promise<void> => {
      await api.patch(`/api/lists/${listId}/items`, { bookId, ...data });
    },
    [],
  );

  const removeItem = useCallback(async (listId: number, bookId: number): Promise<void> => {
    await api.del(`/api/lists/${listId}/items?bookId=${bookId}`);
  }, []);

  return { create, update, addItem, updateItem, removeItem };
}
