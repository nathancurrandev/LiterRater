import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ActivityEventCard from '@/components/ActivityEventCard';
import type { ActivityEvent } from '@/types';

const actor = { id: 1, username: 'alice', displayName: 'Alice', avatarUrl: null, role: 'member' as const };
const book = { id: 10, title: 'Great Book', coverImageUrl: null, authors: [{ id: 1, name: 'Author' }], averageRating: null, ratingCount: 0 };

const finishedEvent: ActivityEvent = { id: 1, type: 'book_finished', actor, book, createdAt: '2026-01-01T00:00:00.000Z' };
const ratedEvent: ActivityEvent = { id: 2, type: 'book_rated', actor, book, createdAt: '2026-01-02T00:00:00.000Z' };
const reviewedEvent: ActivityEvent = {
  id: 3,
  type: 'review_published',
  actor,
  book,
  review: { id: 5, bookId: 10, author: actor, content: 'Amazing book!', containsSpoilers: false, createdAt: '2026-01-03T00:00:00.000Z', updatedAt: '2026-01-03T00:00:00.000Z' },
  createdAt: '2026-01-03T00:00:00.000Z',
};
const listEvent: ActivityEvent = {
  id: 4,
  type: 'list_created',
  actor,
  list: { id: 7, title: 'Faves', description: null, isRanked: false, visibility: 'public', itemCount: 3, owner: actor, createdAt: '2026-01-04T00:00:00.000Z' },
  createdAt: '2026-01-04T00:00:00.000Z',
};

describe('ActivityEventCard', () => {
  it('renders book_finished event with actor and book link', () => {
    render(<MemoryRouter><ActivityEventCard event={finishedEvent} /></MemoryRouter>);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('finished')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Great Book/i })).toHaveAttribute('href', '/books/10');
  });

  it('renders book_rated event', () => {
    render(<MemoryRouter><ActivityEventCard event={ratedEvent} /></MemoryRouter>);
    expect(screen.getByText('rated')).toBeInTheDocument();
  });

  it('renders review_published event with review excerpt', () => {
    render(<MemoryRouter><ActivityEventCard event={reviewedEvent} /></MemoryRouter>);
    expect(screen.getByText(/Amazing book!/)).toBeInTheDocument();
  });

  it('renders list_created event with list link', () => {
    render(<MemoryRouter><ActivityEventCard event={listEvent} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /Faves/i })).toHaveAttribute('href', '/lists/7');
  });
});
