
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FollowButton from '@/components/FollowButton';
import { api } from '@/services/apiClient';

jest.mock('@/services/apiClient', () => ({
  api: {
    post: jest.fn().mockResolvedValue({ ok: true }),
    del: jest.fn().mockResolvedValue({ ok: true }),
  },
}));

describe('FollowButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows Follow when not following', () => {
    render(<FollowButton userId={5} isFollowing={false} />);
    expect(screen.getByRole('button', { name: /follow user/i })).toBeInTheDocument();
  });

  it('shows Unfollow when already following', () => {
    render(<FollowButton userId={5} isFollowing={true} />);
    expect(screen.getByRole('button', { name: /unfollow user/i })).toBeInTheDocument();
  });

  it('calls POST /api/follows/:id on follow', async () => {
    render(<FollowButton userId={5} isFollowing={false} />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/follows/5');
    });
  });

  it('calls DELETE /api/follows/:id on unfollow', async () => {
    render(<FollowButton userId={5} isFollowing={true} />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(api.del).toHaveBeenCalledWith('/api/follows/5');
    });
  });

  it('toggles to Unfollow after following', async () => {
    render(<FollowButton userId={5} isFollowing={false} />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /unfollow user/i })).toBeInTheDocument();
    });
  });
});
