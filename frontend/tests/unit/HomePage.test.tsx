import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import { api } from '@/services/apiClient';

jest.mock('@/services/apiClient', () => ({
  api: {
    get: jest.fn().mockResolvedValue({ data: [] }),
  },
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ currentUser: null, isLoading: false }),
}));

describe('HomePage', () => {
  it('renders without authentication', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /track the books you love/i })).toBeInTheDocument();
  });

  it('shows search prompt', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('searchbox', { name: /search books/i })).toBeInTheDocument();
  });

  it('shows call-to-action for unauthenticated users', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /get started free/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });
});
