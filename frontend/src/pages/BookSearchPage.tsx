import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StarRatingWidget from '@/components/StarRatingWidget';
import { api } from '@/services/apiClient';
import type { BookSummary, PaginationMeta } from '@/types';

export default function BookSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const q = searchParams.get('q') ?? '';
  const page = parseInt(searchParams.get('page') ?? '1', 10) || 1;

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    params.set('page', String(page));
    api
      .get<{ data: BookSummary[]; meta: PaginationMeta }>(`/api/books?${params.toString()}`)
      .then((res) => {
        setBooks(res.data);
        setMeta(res.meta);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Search failed'))
      .finally(() => setIsLoading(false));
  }, [q, page]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchParams({ q: query.trim(), page: '1' });
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Books</h1>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <Input
          type="search"
          placeholder="Search by title or description…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search books"
          className="max-w-sm"
        />
        <Button type="submit">Search</Button>
      </form>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!isLoading && books.length === 0 && q && (
        <p className="text-muted-foreground">No books found for "{q}".</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <Link key={book.id} to={`/books/${book.id}`}>
            <Card className="flex h-full gap-3 p-3 hover:bg-muted/50 transition-colors">
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="h-24 w-16 flex-shrink-0 rounded object-cover"
                />
              ) : (
                <div className="h-24 w-16 flex-shrink-0 rounded bg-muted" />
              )}
              <div className="flex flex-col gap-1 overflow-hidden">
                <p className="font-semibold leading-snug line-clamp-2">{book.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {book.authors.map((a) => a.name).join(', ')}
                </p>
                <StarRatingWidget value={book.averageRating} readonly size="sm" />
                <p className="text-xs text-muted-foreground">
                  {book.ratingCount} rating{book.ratingCount !== 1 ? 's' : ''}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setSearchParams({ q, page: String(page - 1) })}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= meta.totalPages}
            onClick={() => setSearchParams({ q, page: String(page + 1) })}
          >
            Next
          </Button>
        </div>
      )}
    </main>
  );
}
