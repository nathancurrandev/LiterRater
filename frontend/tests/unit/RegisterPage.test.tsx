import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '@/pages/RegisterPage';

// Mock useAuth hook
const mockRegister = jest.fn();
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    currentUser: null,
    isLoading: false,
    login: jest.fn(),
    register: mockRegister,
    logout: jest.fn(),
  }),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

function renderRegisterPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('RegisterPage', () => {
  it('renders all four input fields', () => {
    renderRegisterPage();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    renderRegisterPage();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('calls register with the correct values on submit', async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    renderRegisterPage();

    await userEvent.type(screen.getByLabelText(/email/i), 'new@example.com');
    await userEvent.type(screen.getByLabelText(/^password/i), 'mypassword');
    await userEvent.type(screen.getByLabelText(/username/i), 'bookworm42');
    await userEvent.type(screen.getByLabelText(/display name/i), 'Jane Doe');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'new@example.com',
        'mypassword',
        'bookworm42',
        'Jane Doe',
      );
    });
  });

  it('shows an error message when registration fails', async () => {
    mockRegister.mockRejectedValueOnce(new Error('Username already taken'));
    renderRegisterPage();

    await userEvent.type(screen.getByLabelText(/email/i), 'dup@example.com');
    await userEvent.type(screen.getByLabelText(/^password/i), 'somepass');
    await userEvent.type(screen.getByLabelText(/username/i), 'takenname');
    await userEvent.type(screen.getByLabelText(/display name/i), 'Test User');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Username already taken');
    });
  });

  it('navigates to / after successful registration', async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    renderRegisterPage();

    await userEvent.type(screen.getByLabelText(/email/i), 'new@example.com');
    await userEvent.type(screen.getByLabelText(/^password/i), 'mypassword');
    await userEvent.type(screen.getByLabelText(/username/i), 'bookworm42');
    await userEvent.type(screen.getByLabelText(/display name/i), 'Jane Doe');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('has a link to the login page', () => {
    renderRegisterPage();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });
});
