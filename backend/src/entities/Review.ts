import { Entity, PrimaryKey, Property, ManyToOne, Unique } from '@mikro-orm/core';
import { User } from './User';
import { Book } from './Book';

@Entity({ tableName: 'reviews' })
@Unique({ properties: ['user', 'book'] })
export class Review {
  @PrimaryKey()
  id!: number;

  @Property({ type: 'text' })
  content!: string;

  @Property()
  containsSpoilers: boolean = false;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Book)
  book!: Book;
}
