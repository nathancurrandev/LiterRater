import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ReadingEntry, BookSummary } from '@/types';

interface ReadingEntryCardProps {
  entry: ReadingEntry & { book: BookSummary };
  onEdit: (entry: ReadingEntry & { book: BookSummary }) => void;
  onDelete: (entryId: number) => void;
}

const statusLabel: Record<ReadingEntry['status'], string> = {
  reading: 'Currently reading',
  finished: 'Finished',
  abandoned: 'Abandoned',
};

const statusColor: Record<ReadingEntry['status'], string> = {
  reading: 'bg-blue-100 text-blue-800',
  finished: 'bg-green-100 text-green-800',
  abandoned: 'bg-red-100 text-red-800',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ReadingEntryCard({ entry, onEdit, onDelete }: ReadingEntryCardProps) {
  return (
    <Card className="flex gap-4 p-4">
      {entry.book.coverImageUrl && (
        <img
          src={entry.book.coverImageUrl}
          alt={entry.book.title}
          className="h-24 w-16 flex-shrink-0 rounded object-cover"
        />
      )}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/books/${entry.bookId}`} className="font-semibold hover:underline">
            {entry.book.title}
          </Link>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[entry.status]}`}>
            {statusLabel[entry.status]}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {entry.book.authors.map((a) => a.name).join(', ')}
        </p>
        <div className="flex gap-4 text-xs text-muted-foreground">
          {entry.startDate && <span>Started {formatDate(entry.startDate)}</span>}
          {entry.finishDate && <span>Finished {formatDate(entry.finishDate)}</span>}
          {entry.isReread && <span className="italic">Re-read</span>}
        </div>
        {entry.notes && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{entry.notes}</p>
        )}
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(entry)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onDelete(entry.id)}
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
