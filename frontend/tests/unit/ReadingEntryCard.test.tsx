import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReadingEntryCard from '@/components/ReadingEntryCard';
import type { ReadingEntry, BookSummary } from '@/types';

const book: BookSummary = {
  id: 1,
  title: 'My Book',
  coverImageUrl: null,
  authors: [{ id: 1, name: 'An Author' }],
  averageRating: 4,
  ratingCount: 10,
};

const entry: ReadingEntry & { book: BookSummary } = {
  id: 42,
  bookId: 1,
  status: 'finished',
  startDate: '2026-01-01T00:00:00.000Z',
  finishDate: '2026-02-01T00:00:00.000Z',
  isReread: false,
  notes: 'Great read',
  createdAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
  book,
};

describe('ReadingEntryCard', () => {
  it('renders book title with link', () => {
    render(
      <MemoryRouter>
        <ReadingEntryCard entry={entry} onEdit={jest.fn()} onDelete={jest.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /My Book/i })).toBeInTheDocument();
  });

  it('shows status badge', () => {
    render(
      <MemoryRouter>
        <ReadingEntryCard entry={entry} onEdit={jest.fn()} onDelete={jest.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Finished')).toBeInTheDocument();
  });

  it('calls onEdit when Edit button clicked', () => {
    const onEdit = jest.fn();
    render(
      <MemoryRouter>
        <ReadingEntryCard entry={entry} onEdit={onEdit} onDelete={jest.fn()} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(entry);
  });

  it('calls onDelete when Delete button clicked', () => {
    const onDelete = jest.fn();
    render(
      <MemoryRouter>
        <ReadingEntryCard entry={entry} onEdit={jest.fn()} onDelete={onDelete} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith(42);
  });
});
