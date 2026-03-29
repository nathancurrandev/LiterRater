import { EntityManager } from '@mikro-orm/core';
import { ReadingEntry } from '../entities/ReadingEntry';
import { Rating } from '../entities/Rating';
import { Review } from '../entities/Review';
import { List } from '../entities/List';
import { Follow } from '../entities/Follow';

export interface UserDataExport {
  readingEntries: object[];
  ratings: object[];
  reviews: object[];
  lists: object[];
  follows: object[];
}

export class GdprService {
  constructor(private readonly em: EntityManager) {}

  async exportUserData(userId: number): Promise<UserDataExport> {
    const [readingEntries, ratings, reviews, lists, follows] = await Promise.all([
      this.em.find(ReadingEntry, { user: { id: userId } }, { populate: ['book'] }),
      this.em.find(Rating, { user: { id: userId } }, { populate: ['book'] }),
      this.em.find(Review, { user: { id: userId } }, { populate: ['book'] }),
      this.em.find(List, { owner: { id: userId } }, { populate: ['items', 'items.book'] }),
      this.em.find(Follow, { follower: { id: userId } }, { populate: ['following'] }),
    ]);

    return {
      readingEntries: readingEntries.map((e) => ({
        id: e.id,
        bookTitle: e.book.title,
        status: e.status,
        startDate: e.startDate,
        finishDate: e.finishDate,
        isReread: e.isReread,
        notes: e.notes,
        createdAt: e.createdAt,
      })),
      ratings: ratings.map((r) => ({
        id: r.id,
        bookTitle: r.book.title,
        score: r.score,
        createdAt: r.createdAt,
      })),
      reviews: reviews.map((r) => ({
        id: r.id,
        bookTitle: r.book.title,
        content: r.content,
        containsSpoilers: r.containsSpoilers,
        createdAt: r.createdAt,
      })),
      lists: lists.map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        isRanked: l.isRanked,
        visibility: l.visibility,
        createdAt: l.createdAt,
        items: [...l.items].map((item) => ({
          bookTitle: item.book.title,
          position: item.position,
          notes: item.notes,
        })),
      })),
      follows: follows.map((f) => ({
        followingUsername: f.following.username,
        createdAt: f.createdAt,
      })),
    };
  }
}
