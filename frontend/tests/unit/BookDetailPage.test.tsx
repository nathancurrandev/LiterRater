
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BookDetailPage from '@/pages/BookDetailPage';
import { api } from '@/services/apiClient';
import type { BookDetail } from '@/types';

const mockBook: BookDetail = {
  id: 1,
  title: 'The Rust Book',
  coverImageUrl: null,
  authors: [{ id: 1, name: 'Steve Klabnik' }],
  averageRating: 4.5,
  ratingCount: 100,
  isbn: null,
  publicationYear: 2019,
  description: 'An intro to Rust.',
  pageCount: 500,
  language: 'en',
  tags: [{ id: 1, name: 'Programming', slug: 'programming' }],
  myRating: null,
  myReview: null,
};

jest.mock('@/services/apiClient', () => ({
  api: {
    get: jest.fn(),
  },
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ currentUser: null }),
}));

const mockGet = api.get as jest.Mock;

describe('BookDetailPage (unauthenticated)', () => {
  beforeEach(() => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/api/books/')) return Promise.resolve(mockBook);
      return Promise.resolve({ data: [] });
    });
  });

  it('shows full book content without auth prompt', async () => {
    render(
      <MemoryRouter initialEntries={['/books/1']}>
        <Routes>
          <Route path="/books/:id" element={<BookDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'The Rust Book' })).toBeInTheDocument();
    });

    expect(screen.getByText('An intro to Rust.')).toBeInTheDocument();
    expect(screen.getByText('Programming')).toBeInTheDocument();
  });

  it('does not show Log/Rate actions when unauthenticated', async () => {
    render(
      <MemoryRouter initialEntries={['/books/1']}>
        <Routes>
          <Route path="/books/:id" element={<BookDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'The Rust Book' })).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /log this book/i })).not.toBeInTheDocument();
  });
});
