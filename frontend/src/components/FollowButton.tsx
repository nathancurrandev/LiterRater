import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/services/apiClient';

interface FollowButtonProps {
  userId: number;
  isFollowing: boolean;
  onToggle?: (isNowFollowing: boolean) => void;
}

export default function FollowButton({ userId, isFollowing, onToggle }: FollowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(isFollowing);

  async function handleClick() {
    setLoading(true);
    try {
      if (following) {
        await api.del(`/api/follows/${userId}`);
        setFollowing(false);
        onToggle?.(false);
      } else {
        await api.post(`/api/follows/${userId}`);
        setFollowing(true);
        onToggle?.(true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant={following ? 'outline' : 'default'}
      onClick={handleClick}
      disabled={loading}
      aria-label={following ? 'Unfollow user' : 'Follow user'}
    >
      {loading ? '…' : following ? 'Unfollow' : 'Follow'}
    </Button>
  );
}
