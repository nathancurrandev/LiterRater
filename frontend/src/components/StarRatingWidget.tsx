import React from "react";

interface StarRatingWidgetProps {
  value: number | null;
  onChange?: (score: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClass = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export default function StarRatingWidget({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: StarRatingWidgetProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const starClass = sizeClass[size];
  const display = hovered ?? value ?? 0;

  return (
    <div
      className="flex items-center gap-0.5"
      role={readonly ? 'img' : 'group'}
      aria-label={`Rating: ${value ?? 0} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          className={[
            starClass,
            'transition-colors focus-visible:outline-none focus-visible:ring-2',
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
            display >= star ? 'text-yellow-400' : 'text-muted-foreground/30',
          ].join(' ')}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(null)}
        >
          <svg
            viewBox="0 0 24 24"
            fill={display >= star ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-full w-full"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}
