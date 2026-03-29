import { Entity, PrimaryKey, Property, ManyToMany, Collection } from '@mikro-orm/core';
import { Book } from './Book';

@Entity({ tableName: 'tags' })
export class Tag {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  name!: string;

  @Property({ unique: true })
  slug!: string;

  @ManyToMany(() => Book, (book) => book.tags)
  books: Collection<Book> = new Collection<Book>(this);
}
