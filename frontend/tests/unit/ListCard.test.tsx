
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ListCard from '@/components/ListCard';
import type { ListSummary } from '@/types';

const list: ListSummary = {
  id: 1,
  title: 'Best Sci-Fi',
  description: 'My favourite science fiction books',
  isRanked: true,
  visibility: 'public',
  itemCount: 5,
  owner: { id: 2, username: 'reader', displayName: 'A Reader', avatarUrl: null, role: 'member' },
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('ListCard', () => {
  it('renders list title', () => {
    render(<MemoryRouter><ListCard list={list} /></MemoryRouter>);
    expect(screen.getByText('Best Sci-Fi')).toBeInTheDocument();
  });

  it('shows item count', () => {
    render(<MemoryRouter><ListCard list={list} /></MemoryRouter>);
    expect(screen.getByText(/5 books/i)).toBeInTheDocument();
  });

  it('shows Ranked for ranked lists', () => {
    render(<MemoryRouter><ListCard list={list} /></MemoryRouter>);
    expect(screen.getByText(/ranked/i)).toBeInTheDocument();
  });

  it('shows visibility badge', () => {
    render(<MemoryRouter><ListCard list={list} /></MemoryRouter>);
    expect(screen.getByText('public')).toBeInTheDocument();
  });

  it('links to list detail page', () => {
    render(<MemoryRouter><ListCard list={list} /></MemoryRouter>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/lists/1');
  });
});
