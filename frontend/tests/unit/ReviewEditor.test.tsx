
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReviewEditor from '@/components/ReviewEditor';

describe('ReviewEditor', () => {
  it('renders the textarea and submit button', () => {
    render(<ReviewEditor onSubmit={jest.fn()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit review/i })).toBeInTheDocument();
  });

  it('calls onSubmit with content and spoiler flag', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<ReviewEditor onSubmit={onSubmit} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Great book!' } });
    fireEvent.click(screen.getByLabelText(/contains spoilers/i));
    fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ content: 'Great book!', containsSpoilers: true });
    });
  });

  it('calls onSubmit without spoiler flag by default', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<ReviewEditor onSubmit={onSubmit} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Nice read' } });
    fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ content: 'Nice read', containsSpoilers: false });
    });
  });

  it('shows error when content is empty', async () => {
    render(<ReviewEditor onSubmit={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /submit review/i }));
    await waitFor(() => {
      expect(screen.getByText(/cannot be empty/i)).toBeInTheDocument();
    });
  });
});
