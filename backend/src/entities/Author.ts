import { Entity, PrimaryKey, Property, ManyToMany, Collection } from '@mikro-orm/core';
import { Book } from './Book';

@Entity({ tableName: 'authors' })
export class Author {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property({ nullable: true, type: 'text' })
  bio: string | null = null;

  @Property({ nullable: true })
  birthYear: number | null = null;

  @Property({ nullable: true })
  nationality: string | null = null;

  @ManyToMany(() => Book, (book) => book.authors)
  books: Collection<Book> = new Collection<Book>(this);
}
