
import { render, screen, fireEvent } from '@testing-library/react';
import StarRatingWidget from '@/components/StarRatingWidget';

describe('StarRatingWidget', () => {
  it('renders 5 star buttons', () => {
    render(<StarRatingWidget value={null} />);
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });

  it('calls onChange with correct score when a star is clicked', () => {
    const onChange = jest.fn();
    render(<StarRatingWidget value={null} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('3 stars'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('does not call onChange in readonly mode', () => {
    const onChange = jest.fn();
    render(<StarRatingWidget value={3} onChange={onChange} readonly />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('reflects current value via aria-label', () => {
    render(<StarRatingWidget value={4} readonly />);
    expect(screen.getByRole('img', { name: /Rating: 4 out of 5 stars/i })).toBeInTheDocument();
  });
});
