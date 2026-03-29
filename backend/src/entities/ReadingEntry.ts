import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core';
import { User } from './User';
import { Book } from './Book';

export enum ReadingStatus {
  READING = 'reading',
  FINISHED = 'finished',
  ABANDONED = 'abandoned',
}

@Entity({ tableName: 'reading_entries' })
export class ReadingEntry {
  @PrimaryKey()
  id!: number;

  @Enum({ items: () => ReadingStatus })
  status!: ReadingStatus;

  @Property({ nullable: true })
  startDate: Date | null = null;

  @Property({ nullable: true })
  finishDate: Date | null = null;

  @Property()
  isReread: boolean = false;

  @Property({ nullable: true, type: 'text' })
  notes: string | null = null;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Book)
  book!: Book;
}
