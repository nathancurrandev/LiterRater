import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core';
import { User } from './User';
import { Book } from './Book';
import { Review } from './Review';
import { List } from './List';

export enum ActivityType {
  BOOK_FINISHED = 'book_finished',
  BOOK_RATED = 'book_rated',
  REVIEW_PUBLISHED = 'review_published',
  LIST_CREATED = 'list_created',
}

@Entity({ tableName: 'activities' })
export class Activity {
  @PrimaryKey()
  id!: number;

  @Enum({ items: () => ActivityType })
  type!: ActivityType;

  @Property()
  createdAt: Date = new Date();

  @ManyToOne(() => User)
  actor!: User;

  @ManyToOne(() => Book, { nullable: true })
  book: Book | null = null;

  @ManyToOne(() => Review, { nullable: true })
  review: Review | null = null;

  @ManyToOne(() => List, { nullable: true })
  list: List | null = null;
}
