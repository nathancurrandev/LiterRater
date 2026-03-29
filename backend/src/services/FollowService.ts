import { EntityManager } from '@mikro-orm/core';
import { Follow } from '../entities/Follow';
import { User } from '../entities/User';

export class FollowService {
  constructor(private readonly em: EntityManager) {}

  async follow(followerId: number, followingId: number): Promise<Follow> {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    const existing = await this.em.findOne(Follow, {
      follower: { id: followerId },
      following: { id: followingId },
    });

    if (existing) return existing;

    const follower = await this.em.findOneOrFail(User, followerId);
    const following = await this.em.findOneOrFail(User, followingId, {
      failHandler: () => new Error('User not found'),
    });

    const follow = this.em.create(Follow, { follower, following });
    await this.em.persistAndFlush(follow);
    return follow;
  }

  async unfollow(followerId: number, followingId: number): Promise<void> {
    const follow = await this.em.findOne(Follow, {
      follower: { id: followerId },
      following: { id: followingId },
    });

    if (!follow) return; // idempotent
    await this.em.removeAndFlush(follow);
  }

  async getFollowers(userId: number): Promise<User[]> {
    const follows = await this.em.find(Follow, { following: { id: userId } }, { populate: ['follower'] });
    return follows.map((f) => f.follower);
  }

  async getFollowing(userId: number): Promise<User[]> {
    const follows = await this.em.find(Follow, { follower: { id: userId } }, { populate: ['following'] });
    return follows.map((f) => f.following);
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const follow = await this.em.findOne(Follow, {
      follower: { id: followerId },
      following: { id: followingId },
    });
    return follow !== null;
  }
}
