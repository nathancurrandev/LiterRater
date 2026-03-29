
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateListModal from '@/components/CreateListModal';

const mockList = { id: 1, title: 'My List', description: null, isRanked: false, visibility: 'public' as const, itemCount: 0, owner: { id: 1, username: 'u', displayName: 'U', avatarUrl: null, role: 'member' as const }, createdAt: new Date().toISOString() };

describe('CreateListModal', () => {
  it('renders dialog with title input', () => {
    render(<CreateListModal onSubmit={jest.fn()} onClose={jest.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
  });

  it('calls onSubmit with form data', async () => {
    const onSubmit = jest.fn().mockResolvedValue(mockList);
    render(<CreateListModal onSubmit={onSubmit} onClose={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Favourites' } });
    fireEvent.click(screen.getByLabelText(/ranked list/i));
    fireEvent.click(screen.getByRole('button', { name: /create list/i }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Favourites', isRanked: true }),
      );
    });
  });

  it('shows error on empty title', async () => {
    render(<CreateListModal onSubmit={jest.fn()} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /create list/i }));
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = jest.fn();
    render(<CreateListModal onSubmit={jest.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
