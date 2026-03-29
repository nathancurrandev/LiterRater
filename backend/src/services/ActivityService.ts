import { EntityManager } from '@mikro-orm/core';
import { Activity, ActivityType } from '../entities/Activity';
import { User } from '../entities/User';
import { Book } from '../entities/Book';
import { Review } from '../entities/Review';
import { List } from '../entities/List';
import { Follow } from '../entities/Follow';

interface CreateActivityData {
  actorId: number;
  type: ActivityType;
  bookId?: number;
  reviewId?: number;
  listId?: number;
}

export class ActivityService {
  constructor(private readonly em: EntityManager) {}

  async createEvent(data: CreateActivityData): Promise<Activity> {
    const actor = await this.em.findOneOrFail(User, data.actorId);

    const activity = this.em.create(Activity, {
      actor,
      type: data.type,
      book: data.bookId ? this.em.getReference(Book, data.bookId) : null,
      review: data.reviewId ? this.em.getReference(Review, data.reviewId) : null,
      list: data.listId ? this.em.getReference(List, data.listId) : null,
    });

    await this.em.persistAndFlush(activity);
    return activity;
  }

  async getFeedForUser(
    userId: number,
    page = 1,
    limit = 20,
  ): Promise<{ activities: Activity[]; total: number }> {
    const followRows = await this.em.find(Follow, { follower: { id: userId } });
    const followingIds = followRows.map((f) => f.following.id);

    if (followingIds.length === 0) {
      return { activities: [], total: 0 };
    }

    const offset = (page - 1) * limit;
    const [activities, total] = await this.em.findAndCount(
      Activity,
      { actor: { id: { $in: followingIds } } },
      {
        populate: ['actor', 'book', 'book.authors', 'review', 'review.user', 'list', 'list.owner'],
        orderBy: { createdAt: 'DESC' },
        limit,
        offset,
      },
    );

    return { activities, total };
  }
}
