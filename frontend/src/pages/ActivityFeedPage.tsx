import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ActivityEventCard from '@/components/ActivityEventCard';
import { useFeed } from '@/hooks/useFeed';

export default function ActivityFeedPage() {
  const [page, setPage] = useState(1);
  const { events, meta, isLoading, error } = useFeed(page);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Activity Feed</h1>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!isLoading && events.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="mb-2 text-lg font-medium text-muted-foreground">Nothing here yet</p>
          <p className="text-sm text-muted-foreground">
            Find readers to follow by{' '}
            <Link to="/books" className="underline">
              searching for books
            </Link>{' '}
            and checking out who's reading them.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {events.map((event) => (
          <ActivityEventCard key={event.id} event={event} />
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {meta.totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </main>
  );
}
