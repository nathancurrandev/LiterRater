
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import type { ActivityEvent } from '@/types';

interface ActivityEventCardProps {
  event: ActivityEvent;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const eventDescription: Record<ActivityEvent['type'], string> = {
  book_finished: 'finished',
  book_rated: 'rated',
  review_published: 'reviewed',
  list_created: 'created list',
};

export default function ActivityEventCard({ event }: ActivityEventCardProps) {
  return (
    <Card className="p-4 space-y-1">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm">
          <Link to={`/users/${event.actor.id}`} className="font-semibold hover:underline">
            {event.actor.displayName}
          </Link>{' '}
          <span className="text-muted-foreground">{eventDescription[event.type]}</span>{' '}
          {event.book && (
            <Link to={`/books/${event.book.id}`} className="font-medium hover:underline">
              {event.book.title}
            </Link>
          )}
          {event.list && (
            <Link to={`/lists/${event.list.id}`} className="font-medium hover:underline">
              {event.list.title}
            </Link>
          )}
        </p>
        <span className="shrink-0 text-xs text-muted-foreground">{formatDate(event.createdAt)}</span>
      </div>

      {event.review && (
        <p className="text-sm text-muted-foreground line-clamp-2 italic">
          "{event.review.content}"
        </p>
      )}
    </Card>
  );
}
