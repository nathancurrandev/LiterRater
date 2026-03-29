
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LogBookModal from '@/components/LogBookModal';
import type { BookSummary } from '@/types';

const book: BookSummary = {
  id: 1,
  title: 'Test Book',
  coverImageUrl: null,
  authors: [{ id: 1, name: 'Author One' }],
  averageRating: null,
  ratingCount: 0,
};

describe('LogBookModal', () => {
  it('renders book title in heading', () => {
    render(
      <MemoryRouter>
        <LogBookModal book={book} existing={null} onSubmit={jest.fn()} onClose={jest.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Test Book/)).toBeInTheDocument();
  });

  it('calls onSubmit with form data on submit', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();
    render(
      <MemoryRouter>
        <LogBookModal book={book} existing={null} onSubmit={onSubmit} onClose={onClose} />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'finished' } });
    fireEvent.click(screen.getByRole('button', { name: /log book/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'finished' }),
      );
    });
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = jest.fn();
    render(
      <MemoryRouter>
        <LogBookModal book={book} existing={null} onSubmit={jest.fn()} onClose={onClose} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows error message on submit failure', async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error('Server error'));
    render(
      <MemoryRouter>
        <LogBookModal book={book} existing={null} onSubmit={onSubmit} onClose={jest.fn()} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /log book/i }));
    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });
});
