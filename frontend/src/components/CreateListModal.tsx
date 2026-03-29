import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ListSummary } from '@/types';

interface CreateListModalProps {
  onSubmit: (data: {
    title: string;
    description: string | null;
    isRanked: boolean;
    visibility: 'public' | 'private';
  }) => Promise<ListSummary>;
  onClose: () => void;
}

export default function CreateListModal({ onSubmit, onClose }: CreateListModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isRanked, setIsRanked] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        isRanked,
        visibility,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create list');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create a new list"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">Create a new list</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="list-title">Title</Label>
            <Input
              id="list-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My reading list"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="list-description">Description (optional)</Label>
            <textarea
              id="list-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              placeholder="What is this list about?"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is-ranked"
              type="checkbox"
              checked={isRanked}
              onChange={(e) => setIsRanked(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            <Label htmlFor="is-ranked">Ranked list (books have positions)</Label>
          </div>

          <div>
            <Label htmlFor="visibility">Visibility</Label>
            <select
              id="visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="public">Public — anyone can see this list</option>
              <option value="private">Private — only you can see this list</option>
            </select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create list'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
