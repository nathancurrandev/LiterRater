import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import type { UserSummary } from '@/types';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// We'll control useAuth per-test via this variable
let mockAuthValue: {
  currentUser: UserSummary | null;
  isLoading: boolean;
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => Promise<void>;
};

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuthValue,
}));

const authenticatedUser: UserSummary = {
  id: 1,
  username: 'bookworm42',
  displayName: 'Jane Doe',
  avatarUrl: null,
  role: 'member',
};

function renderHeader() {
  return render(
    <MemoryRouter>
      <AppHeader />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthValue = {
    currentUser: null,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  };
});

describe('AppHeader', () => {
  describe('when not authenticated', () => {
    it('shows Login and Register links', () => {
      renderHeader();
      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
    });

    it('does not show username or Logout button', () => {
      renderHeader();
      expect(screen.queryByText('bookworm42')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      mockAuthValue = {
        currentUser: authenticatedUser,
        isLoading: false,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
      };
    });

    it('shows the username', () => {
      renderHeader();
      expect(screen.getByText('bookworm42')).toBeInTheDocument();
    });

    it('shows the Logout button', () => {
      renderHeader();
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    it('does not show Login or Register links', () => {
      renderHeader();
      expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /register/i })).not.toBeInTheDocument();
    });
  });

  describe('search input', () => {
    it('navigates to /books?q=<value> when search is submitted', async () => {
      renderHeader();
      const searchInput = screen.getByRole('searchbox', { name: /search books/i });
      await userEvent.type(searchInput, 'dune');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/books?q=dune');
      });
    });

    it('navigates to /books when search is submitted with only whitespace', async () => {
      renderHeader();
      const searchInput = screen.getByRole('searchbox', { name: /search books/i });
      await userEvent.type(searchInput, '   ');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/books');
      });
    });
  });
});
