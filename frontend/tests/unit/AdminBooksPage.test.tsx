import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminBooksPage from '@/pages/admin/AdminBooksPage';
import { api } from '@/services/apiClient';
import type { BookSummary } from '@/types';

const books: BookSummary[] = [
  { id: 1, title: 'Rust Programming', coverImageUrl: null, authors: [{ id: 1, name: 'Steve' }], averageRating: null, ratingCount: 0 },
  { id: 2, title: 'TypeScript Deep Dive', coverImageUrl: null, authors: [{ id: 2, name: 'Basarat' }], averageRating: null, ratingCount: 0 },
];

jest.mock('@/services/apiClient', () => ({
  api: {
    get: jest.fn().mockResolvedValue({ data: [] }),
    del: jest.fn().mockResolvedValue({ ok: true }),
  },
}));

const mockGet = api.get as jest.Mock;

describe('AdminBooksPage', () => {
  beforeEach(() => {
    mockGet.mockResolvedValue({ data: books });
  });

  it('renders the books table', async () => {
    render(<AdminBooksPage />);
    await waitFor(() => {
      expect(screen.getByText('Rust Programming')).toBeInTheDocument();
      expect(screen.getByText('TypeScript Deep Dive')).toBeInTheDocument();
    });
  });

  it('opens the add book dialog when Add book is clicked', async () => {
    render(<AdminBooksPage />);
    await waitFor(() => screen.getByText('Rust Programming'));
    fireEvent.click(screen.getByRole('button', { name: /add book/i }));
    expect(screen.getByRole('dialog', { name: /add book/i })).toBeInTheDocument();
  });
});
