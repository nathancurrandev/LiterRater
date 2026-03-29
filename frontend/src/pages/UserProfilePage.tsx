import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ListCard from '@/components/ListCard';
import { api } from '@/services/apiClient';
import { useAuth } from '@/hooks/useAuth';
import type { UserProfile, ListSummary } from '@/types';

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [lists, setLists] = useState<ListSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    Promise.all([
      api.get<UserProfile>(`/api/users/${id}`),
      api.get<{ data: ListSummary[] }>(`/api/users/${id}/lists`),
    ])
      .then(([p, l]) => {
        setProfile(p);
        setIsFollowing(p.isFollowedByMe);
        setLists(l.data);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load profile'))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleFollow() {
    if (!id || !currentUser) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await api.del(`/api/follows/${id}`);
        setIsFollowing(false);
        setProfile((p) => p ? { ...p, followersCount: p.followersCount - 1 } : p);
      } else {
        await api.post(`/api/follows/${id}`);
        setIsFollowing(true);
        setProfile((p) => p ? { ...p, followersCount: p.followersCount + 1 } : p);
      }
    } catch {
      // follow failed; UI will reset on next profile load
    } finally {
      setFollowLoading(false);
    }
  }

  if (isLoading) return <main className="mx-auto max-w-3xl px-4 py-8"><p className="text-muted-foreground">Loading…</p></main>;
  if (error || !profile) return <main className="mx-auto max-w-3xl px-4 py-8"><p className="text-sm text-destructive">{error ?? 'User not found'}</p></main>;

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-start gap-4">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={profile.displayName} className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
            {profile.displayName[0]?.toUpperCase() ?? '?'}
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{profile.displayName}</h1>
            <span className="text-muted-foreground">@{profile.username}</span>
            {currentUser && !isOwnProfile && (
              <Button
                size="sm"
                variant={isFollowing ? 'outline' : 'default'}
                onClick={handleFollow}
                disabled={followLoading}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </div>
          {profile.bio && <p className="mt-1 text-sm text-muted-foreground">{profile.bio}</p>}
          <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
            <span>{profile.booksLoggedCount} books logged</span>
            {profile.averageRating !== null && <span>{profile.averageRating.toFixed(1)} avg rating</span>}
            <span>{profile.followersCount} followers</span>
            <span>{profile.followingCount} following</span>
          </div>
        </div>
      </div>

      {lists.length > 0 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Lists</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {lists.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>
        </section>
      ) : (
        <p className="text-muted-foreground">
          {isOwnProfile ? (
            <>
              No lists yet.{' '}
              <Link to="/diary" className="underline">
                Start logging books
              </Link>{' '}
              to create lists.
            </>
          ) : (
            `${profile.displayName} hasn't created any public lists yet.`
          )}
        </p>
      )}
    </main>
  );
}
