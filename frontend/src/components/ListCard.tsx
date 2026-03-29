
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import type { ListSummary } from '@/types';

interface ListCardProps {
  list: ListSummary;
}

export default function ListCard({ list }: ListCardProps) {
  return (
    <Link to={`/lists/${list.id}`}>
      <Card className="p-4 hover:bg-muted/50 transition-colors space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold line-clamp-2 leading-snug">{list.title}</h3>
          <span
            className={[
              'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
              list.visibility === 'public'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600',
            ].join(' ')}
          >
            {list.visibility}
          </span>
        </div>
        {list.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{list.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {list.itemCount} book{list.itemCount !== 1 ? 's' : ''}
          {list.isRanked ? ' · Ranked' : ''}
        </p>
      </Card>
    </Link>
  );
}
