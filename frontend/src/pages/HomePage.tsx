import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StarRatingWidget from '@/components/StarRatingWidget';
import { api } from '@/services/apiClient';
import { useAuth } from '@/hooks/useAuth';
import type { BookSummary } from '@/types';

export default function HomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [recentBooks, setRecentBooks] = useState<BookSummary[]>([]);

  useEffect(() => {
    api
      .get<{ data: BookSummary[] }>('/api/books?limit=6')
      .then((res) => setRecentBooks(res.data))
      .catch(() => {/* non-critical */});
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    navigate(`/books${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Track the books you love.
        </h1>
        <p className="text-muted-foreground text-lg mb-6">
          Log what you're reading, rate it, review it, and discover what your friends are reading.
        </p>

        <form onSubmit={handleSearch} className="flex justify-center gap-2 max-w-sm mx-auto">
          <Input
            type="search"
            placeholder="Search books…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search books"
          />
          <Button type="submit">Search</Button>
        </form>
      </section>

      {!currentUser && (
        <section className="mb-12 flex flex-col items-center gap-3">
          <p className="text-muted-foreground">Join LiterRater to track your reading journey.</p>
          <div className="flex gap-3">
            <Button asChild>
              <Link to="/register">Get started free</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </section>
      )}

      {recentBooks.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Catalogue</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentBooks.map((book) => (
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
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button asChild variant="outline">
              <Link to="/books">Browse all books</Link>
            </Button>
          </div>
        </section>
      )}
    </main>
  );
}
