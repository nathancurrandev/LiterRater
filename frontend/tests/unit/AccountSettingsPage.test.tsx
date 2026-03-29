import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AccountSettingsPage from '@/pages/AccountSettingsPage';

jest.mock('@/services/apiClient', () => ({
  api: { del: jest.fn().mockResolvedValue({ ok: true }) },
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    currentUser: { id: 1, username: 'tester', displayName: 'Tester', avatarUrl: null, role: 'member' },
    logout: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe('AccountSettingsPage', () => {
  it('renders the page heading', () => {
    render(<MemoryRouter><AccountSettingsPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /account settings/i })).toBeInTheDocument();
  });

  it('shows the export data button', () => {
    render(<MemoryRouter><AccountSettingsPage /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /download my data/i })).toBeInTheDocument();
  });

  it('opens delete confirmation dialog when Delete account is clicked', () => {
    render(<MemoryRouter><AccountSettingsPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /delete my account/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('closes dialog when Cancel is clicked', () => {
    render(<MemoryRouter><AccountSettingsPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /delete my account/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
