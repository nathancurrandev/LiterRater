import { Entity, PrimaryKey, Property, ManyToOne, Unique } from '@mikro-orm/core';
import { User } from './User';
import { Book } from './Book';

@Entity({ tableName: 'ratings' })
@Unique({ properties: ['user', 'book'] })
export class Rating {
  @PrimaryKey()
  id!: number;

  @Property()
  score!: number;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Book)
  book!: Book;
}
