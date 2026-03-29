import { EntityManager } from '@mikro-orm/core';
import { Review } from '../entities/Review';
import { User } from '../entities/User';
import { Book } from '../entities/Book';

interface UpsertReviewData {
  bookId: number;
  content: string;
  containsSpoilers?: boolean;
}

export class ReviewService {
  constructor(private readonly em: EntityManager) {}

  async upsert(userId: number, data: UpsertReviewData): Promise<Review> {
    if (!data.content.trim()) {
      throw new Error('Review content cannot be empty');
    }

    const user = await this.em.findOneOrFail(User, userId);
    const book = await this.em.findOneOrFail(Book, data.bookId, {
      failHandler: () => new Error('Book not found'),
    });

    let review = await this.em.findOne(Review, { user: { id: userId }, book: { id: data.bookId } });

    if (review) {
      review.content = data.content;
      review.containsSpoilers = data.containsSpoilers ?? review.containsSpoilers;
      await this.em.flush();
    } else {
      review = this.em.create(Review, {
        user,
        book,
        content: data.content,
        containsSpoilers: data.containsSpoilers ?? false,
      });
      await this.em.persistAndFlush(review);
    }

    return review;
  }

  async delete(userId: number, bookId: number): Promise<void> {
    const review = await this.em.findOne(Review, { user: { id: userId }, book: { id: bookId } });
    if (!review) {
      throw new Error('Review not found');
    }
    await this.em.removeAndFlush(review);
  }

  async listForBook(
    bookId: number,
    page = 1,
    limit = 20,
  ): Promise<{ reviews: Review[]; total: number }> {
    const offset = (page - 1) * limit;
    const [reviews, total] = await this.em.findAndCount(
      Review,
      { book: { id: bookId } },
      {
        populate: ['user'],
        orderBy: { createdAt: 'DESC' },
        limit,
        offset,
      },
    );
    return { reviews, total };
  }
}
