
import { render, screen, fireEvent } from '@testing-library/react';
import ReviewCard from '@/components/ReviewCard';
import type { Review } from '@/types';

const review: Review = {
  id: 1,
  bookId: 10,
  author: {
    id: 5,
    username: 'reader',
    displayName: 'A Reader',
    avatarUrl: null,
    role: 'member',
  },
  content: 'A wonderful read.',
  containsSpoilers: false,
  createdAt: '2026-01-15T00:00:00.000Z',
  updatedAt: '2026-01-15T00:00:00.000Z',
};

const spoilerReview: Review = {
  ...review,
  id: 2,
  content: 'The main character dies at the end.',
  containsSpoilers: true,
};

describe('ReviewCard', () => {
  it('renders review content when no spoiler', () => {
    render(<ReviewCard review={review} />);
    expect(screen.getByText('A wonderful read.')).toBeInTheDocument();
  });

  it('hides spoiler content behind a warning initially', () => {
    render(<ReviewCard review={spoilerReview} />);
    expect(screen.queryByText('The main character dies at the end.')).not.toBeInTheDocument();
    expect(screen.getByText(/contains spoilers/i)).toBeInTheDocument();
  });

  it('shows spoiler content after clicking Show anyway', () => {
    render(<ReviewCard review={spoilerReview} />);
    fireEvent.click(screen.getByRole('button', { name: /show anyway/i }));
    expect(screen.getByText('The main character dies at the end.')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked for own review', () => {
    const onDelete = jest.fn();
    render(<ReviewCard review={review} isOwn onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: /delete review/i }));
    expect(onDelete).toHaveBeenCalled();
  });

  it('does not show delete button when not own review', () => {
    render(<ReviewCard review={review} isOwn={false} />);
    expect(screen.queryByRole('button', { name: /delete review/i })).not.toBeInTheDocument();
  });
});
