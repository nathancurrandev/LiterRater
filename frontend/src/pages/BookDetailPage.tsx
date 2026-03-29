import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StarRatingWidget from '@/components/StarRatingWidget';
import LogBookModal from '@/components/LogBookModal';
import ReviewCard from '@/components/ReviewCard';
import ReviewEditor from '@/components/ReviewEditor';
import { api } from '@/services/apiClient';
import { useAuth } from '@/hooks/useAuth';
import { useReview } from '@/hooks/useReview';
import type { BookDetail, ReadingEntry, Review } from '@/types';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [myEntry, setMyEntry] = useState<ReadingEntry | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const { upsert: upsertReview, remove: deleteReview } = useReview(Number(id) || 0);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    Promise.all([
      api.get<BookDetail>(`/api/books/${id}`),
      api.get<{ data: Review[] }>(`/api/books/${id}/reviews`),
    ])
      .then(([b, r]) => {
        setBook(b);
        setReviews(r.data);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load book'))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !currentUser) return;
    api
      .get<{ data: ReadingEntry[] }>(`/api/reading-entries?bookId=${id}`)
      .then((res) => setMyEntry(res.data[0] ?? null))
      .catch(() => undefined);
  }, [id, currentUser]);

  async function handleRate(score: number) {
    if (!id || !currentUser) return;
    setRatingLoading(true);
    try {
      await api.post('/api/ratings', { bookId: Number(id), score });
      setBook((b) => b ? { ...b, myRating: score } : b);
    } catch {
      // rating failed; state unchanged
    } finally {
      setRatingLoading(false);
    }
  }

  async function handleLog(data: {
    status: 'reading' | 'finished' | 'abandoned';
    startDate: string | null;
    finishDate: string | null;
    isReread: boolean;
    notes: string | null;
  }) {
    if (!id) return;
    if (myEntry) {
      const updated = await api.patch<ReadingEntry>(`/api/reading-entries/${myEntry.id}`, data);
      setMyEntry(updated);
    } else {
      const created = await api.post<ReadingEntry>('/api/reading-entries', {
        bookId: Number(id),
        ...data,
      });
      setMyEntry(created);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (error || !book) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-destructive">{error ?? 'Book not found'}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex gap-6">
        {book.coverImageUrl && (
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="h-48 w-32 flex-shrink-0 rounded object-cover shadow"
          />
        )}
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-bold">{book.title}</h1>
          <p className="text-muted-foreground">
            {book.authors.map((a) => (
              <Link key={a.id} to={`/authors/${a.id}`} className="hover:underline">
                {a.name}
              </Link>
            ))}
          </p>
          {book.publicationYear && (
            <p className="text-sm text-muted-foreground">{book.publicationYear}</p>
          )}
          <div className="flex items-center gap-3">
            <StarRatingWidget value={book.averageRating} readonly size="sm" />
            <span className="text-sm text-muted-foreground">
              {book.averageRating !== null
                ? `${book.averageRating.toFixed(1)} (${book.ratingCount} rating${book.ratingCount !== 1 ? 's' : ''})`
                : 'No ratings yet'}
            </span>
          </div>

          {currentUser && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button size="sm" onClick={() => setShowLogModal(true)}>
                {myEntry ? 'Update log' : 'Log this book'}
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Your rating:</span>
                <StarRatingWidget
                  value={book.myRating}
                  onChange={ratingLoading ? undefined : handleRate}
                  size="sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {book.description && (
        <section className="mt-8">
          <h2 className="mb-2 text-lg font-semibold">About this book</h2>
          <p className="text-muted-foreground leading-relaxed">{book.description}</p>
        </section>
      )}

      {book.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {book.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Reviews</h2>
        {currentUser && !book.myReview && (
          <div className="mb-6 rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-medium">Write a review</h3>
            <ReviewEditor
              onSubmit={async (data) => {
                const review = await upsertReview(data);
                setReviews((prev) => [review, ...prev]);
              }}
            />
          </div>
        )}
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isOwn={currentUser?.id === review.author.id}
                onDelete={async () => {
                  await deleteReview();
                  setReviews((prev) => prev.filter((r) => r.id !== review.id));
                }}
              />
            ))}
          </div>
        )}
      </section>

      {showLogModal && (
        <LogBookModal
          book={book}
          existing={myEntry}
          onSubmit={handleLog}
          onClose={() => setShowLogModal(false)}
        />
      )}
    </main>
  );
}
