import { EntityManager } from '@mikro-orm/core';
import { Rating } from '../entities/Rating';
import { User } from '../entities/User';
import { Book } from '../entities/Book';

export class RatingService {
  constructor(private readonly em: EntityManager) {}

  async upsert(userId: number, bookId: number, score: number): Promise<Rating> {
    if (score < 1 || score > 5 || !Number.isInteger(score)) {
      throw new Error('Score must be an integer between 1 and 5');
    }

    const user = await this.em.findOneOrFail(User, userId);
    const book = await this.em.findOneOrFail(Book, bookId, { failHandler: () => new Error('Book not found') });

    let rating = await this.em.findOne(Rating, { user: { id: userId }, book: { id: bookId } });

    if (rating) {
      rating.score = score;
      await this.em.flush();
    } else {
      rating = this.em.create(Rating, { user, book, score });
      await this.em.persistAndFlush(rating);
    }

    return rating;
  }

  async delete(userId: number, bookId: number): Promise<void> {
    const rating = await this.em.findOne(Rating, { user: { id: userId }, book: { id: bookId } });

    if (!rating) {
      throw new Error('Rating not found');
    }

    await this.em.removeAndFlush(rating);
  }

  async getForUser(userId: number, bookId: number): Promise<Rating | null> {
    return this.em.findOne(Rating, { user: { id: userId }, book: { id: bookId } });
  }
}
