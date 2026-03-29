import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
  isOwn?: boolean;
  onDelete?: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ReviewCard({ review, isOwn, onDelete }: ReviewCardProps) {
  const [spoilerVisible, setSpoilerVisible] = useState(false);

  return (
    <Card className="p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-semibold">{review.author.displayName}</span>
          <span className="ml-2 text-xs text-muted-foreground">@{review.author.username}</span>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{formatDate(review.createdAt)}</span>
      </div>

      {review.containsSpoilers && !spoilerVisible ? (
        <div className="rounded bg-muted p-3 text-center">
          <p className="text-sm text-muted-foreground mb-2">This review contains spoilers.</p>
          <Button size="sm" variant="outline" onClick={() => setSpoilerVisible(true)}>
            Show anyway
          </Button>
        </div>
      ) : (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{review.content}</p>
      )}

      {review.containsSpoilers && spoilerVisible && (
        <Button
          size="sm"
          variant="ghost"
          className="text-xs text-muted-foreground"
          onClick={() => setSpoilerVisible(false)}
        >
          Hide spoilers
        </Button>
      )}

      {isOwn && onDelete && (
        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={onDelete}
        >
          Delete review
        </Button>
      )}
    </Card>
  );
}
