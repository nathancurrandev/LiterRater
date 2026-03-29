import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BookSummary, ReadingEntry } from '@/types';

interface LogBookModalProps {
  book: BookSummary;
  existing?: ReadingEntry | null;
  onSubmit: (data: {
    status: 'reading' | 'finished' | 'abandoned';
    startDate: string | null;
    finishDate: string | null;
    isReread: boolean;
    notes: string | null;
  }) => Promise<void>;
  onClose: () => void;
}

export default function LogBookModal({ book, existing, onSubmit, onClose }: LogBookModalProps) {
  const [status, setStatus] = useState<'reading' | 'finished' | 'abandoned'>(
    existing?.status ?? 'reading',
  );
  const [startDate, setStartDate] = useState(existing?.startDate?.slice(0, 10) ?? '');
  const [finishDate, setFinishDate] = useState(existing?.finishDate?.slice(0, 10) ?? '');
  const [isReread, setIsReread] = useState(existing?.isReread ?? false);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        status,
        startDate: startDate || null,
        finishDate: finishDate || null,
        isReread,
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Log "${book.title}"`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">Log "{book.title}"</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="reading">Currently reading</option>
              <option value="finished">Finished</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="finishDate">Finish date</Label>
              <Input
                id="finishDate"
                type="date"
                value={finishDate}
                onChange={(e) => setFinishDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isReread"
              type="checkbox"
              checked={isReread}
              onChange={(e) => setIsReread(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="isReread">This is a re-read</Label>
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              placeholder="Private notes about this read…"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : existing ? 'Update' : 'Log book'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
