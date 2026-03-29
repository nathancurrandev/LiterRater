import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ReadingEntryCard from '@/components/ReadingEntryCard';
import LogBookModal from '@/components/LogBookModal';
import { useReadingEntries } from '@/hooks/useReadingEntry';
import type { ReadingEntry, BookSummary } from '@/types';

type ReadingEntryWithBook = ReadingEntry & { book: BookSummary };

type StatusFilter = 'all' | 'reading' | 'finished' | 'abandoned';

const filterOptions: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Reading', value: 'reading' },
  { label: 'Finished', value: 'finished' },
  { label: 'Abandoned', value: 'abandoned' },
];

export default function ReadingDiaryPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<ReadingEntryWithBook | null>(null);

  const { entries, meta, isLoading, error, update, remove } = useReadingEntries({
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
  });

  async function handleUpdate(data: {
    status: 'reading' | 'finished' | 'abandoned';
    startDate: string | null;
    finishDate: string | null;
    isReread: boolean;
    notes: string | null;
  }) {
    if (!editing) return;
    await update(editing.id, data);
    setEditing(null);
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this entry?')) return;
    await remove(id);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Reading Diary</h1>
        <Button asChild size="sm">
          <Link to="/books">Log a book</Link>
        </Button>
      </div>

      <div className="mb-4 flex gap-2">
        {filterOptions.map((opt) => (
          <Button
            key={opt.value}
            size="sm"
            variant={statusFilter === opt.value ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter(opt.value);
              setPage(1);
            }}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!isLoading && entries.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <p className="mb-2 text-lg font-medium">No entries yet</p>
          <p className="text-sm">
            <Link to="/books" className="underline">
              Search for a book
            </Link>{' '}
            to start logging your reads.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {entries.map((entry) => (
          <ReadingEntryCard
            key={entry.id}
            entry={entry}
            onEdit={setEditing}
            onDelete={handleDelete}
          />
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
            Page {meta.page} of {meta.totalPages}
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

      {editing && (
        <LogBookModal
          book={editing.book}
          existing={editing}
          onSubmit={handleUpdate}
          onClose={() => setEditing(null)}
        />
      )}
    </main>
  );
}
