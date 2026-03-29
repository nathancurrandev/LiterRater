import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ReviewEditorProps {
  initialContent?: string;
  initialContainsSpoilers?: boolean;
  onSubmit: (data: { content: string; containsSpoilers: boolean }) => Promise<void>;
}

export default function ReviewEditor({
  initialContent = '',
  initialContainsSpoilers = false,
  onSubmit,
}: ReviewEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [containsSpoilers, setContainsSpoilers] = useState(initialContainsSpoilers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError('Review cannot be empty');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ content: content.trim(), containsSpoilers });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="review-content">Your review</Label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
          placeholder="Write your thoughts about this book…"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="contains-spoilers"
          type="checkbox"
          checked={containsSpoilers}
          onChange={(e) => setContainsSpoilers(e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor="contains-spoilers">This review contains spoilers</Label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? 'Submitting…' : 'Submit review'}
      </Button>
    </form>
  );
}
