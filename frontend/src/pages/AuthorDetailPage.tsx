import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import StarRatingWidget from '@/components/StarRatingWidget';
import { api } from '@/services/apiClient';
import type { AuthorDetail, BookSummary } from '@/types';

interface AuthorDetailWithBooks extends AuthorDetail {
  books: BookSummary[];
}

export default function AuthorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [author, setAuthor] = useState<AuthorDetailWithBooks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .get<AuthorDetailWithBooks>(`/api/authors/${id}`)
      .then(setAuthor)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load author'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <main className="mx-auto max-w-3xl px-4 py-8"><p className="text-muted-foreground">Loading…</p></main>;
  if (error || !author) return <main className="mx-auto max-w-3xl px-4 py-8"><p className="text-sm text-destructive">{error ?? 'Author not found'}</p></main>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">{author.name}</h1>
        {author.nationality && (
          <p className="text-sm text-muted-foreground">{author.nationality}</p>
        )}
        {author.birthYear && (
          <p className="text-sm text-muted-foreground">b. {author.birthYear}</p>
        )}
        {author.bio && (
          <p className="mt-3 text-muted-foreground leading-relaxed">{author.bio}</p>
        )}
      </div>

      {author.books.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Books</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {author.books.map((book) => (
              <Link key={book.id} to={`/books/${book.id}`}>
                <Card className="flex gap-3 p-3 hover:bg-muted/50 transition-colors">
                  {book.coverImageUrl ? (
                    <img src={book.coverImageUrl} alt={book.title} className="h-20 w-14 rounded object-cover shrink-0" />
                  ) : (
                    <div className="h-20 w-14 rounded bg-muted shrink-0" />
                  )}
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="font-medium leading-snug line-clamp-2">{book.title}</p>
                    <StarRatingWidget value={book.averageRating} readonly size="sm" />
                    <p className="text-xs text-muted-foreground">{book.ratingCount} ratings</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
