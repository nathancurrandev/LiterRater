import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { api } from '@/services/apiClient';
import { useAuth } from '@/hooks/useAuth';
import { useList } from '@/hooks/useList';
import type { ListDetail } from '@/types';

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { removeItem } = useList();
  const [list, setList] = useState<ListDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api
      .get<ListDetail>(`/api/lists/${id}`)
      .then(setList)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load list'))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleRemoveItem(bookId: number) {
    if (!id || !list) return;
    if (!confirm('Remove this book from the list?')) return;
    await removeItem(Number(id), bookId);
    setList((prev) =>
      prev ? { ...prev, items: prev.items.filter((item) => item.bookId !== bookId) } : prev,
    );
  }

  if (isLoading) return <main className="mx-auto max-w-3xl px-4 py-8"><p className="text-muted-foreground">Loading…</p></main>;
  if (error || !list) return <main className="mx-auto max-w-3xl px-4 py-8"><p className="text-sm text-destructive">{error ?? 'List not found'}</p></main>;

  const isOwner = currentUser?.id === list.owner.id;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{list.title}</h1>
            <p className="text-sm text-muted-foreground">
              by{' '}
              <Link to={`/users/${list.owner.id}`} className="hover:underline">
                {list.owner.displayName}
              </Link>
              {' · '}
              {list.isRanked ? 'Ranked · ' : ''}
              <span className="capitalize">{list.visibility}</span>
            </p>
          </div>
        </div>
        {list.description && (
          <p className="mt-2 text-muted-foreground">{list.description}</p>
        )}
      </div>

      {list.items.length === 0 ? (
        <p className="text-muted-foreground">No books in this list yet.</p>
      ) : (
        <ol className="space-y-3">
          {list.items.map((item, index) => (
            <li key={item.bookId} className="flex items-center gap-4">
              {list.isRanked && (
                <span className="w-6 text-right text-sm font-mono text-muted-foreground shrink-0">
                  {item.position ?? index + 1}
                </span>
              )}
              {item.book.coverImageUrl && (
                <img
                  src={item.book.coverImageUrl}
                  alt={item.book.title}
                  className="h-16 w-11 rounded object-cover shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <Link to={`/books/${item.bookId}`} className="font-medium hover:underline">
                  {item.book.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {item.book.authors.map((a) => a.name).join(', ')}
                </p>
                {item.notes && <p className="mt-0.5 text-xs text-muted-foreground">{item.notes}</p>}
              </div>
              {isOwner && (
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveItem(item.bookId)}
                >
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
