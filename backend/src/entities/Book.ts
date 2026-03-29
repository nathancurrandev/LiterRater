import {
  Entity,
  PrimaryKey,
  Property,
  ManyToMany,
  Collection,
  Index,
  type Opt,
} from '@mikro-orm/core';
import { Author } from './Author';
import { Tag } from './Tag';

@Entity({ tableName: 'books' })
@Index({ properties: ['title', 'description'], type: 'fulltext' })
export class Book {
  @PrimaryKey()
  id!: number;

  @Property()
  title!: string;

  @Property({ nullable: true, unique: true })
  isbn: string | null = null;

  @Property({ nullable: true })
  publicationYear: number | null = null;

  @Property({ nullable: true, type: 'text' })
  description: string | null = null;

  @Property({ nullable: true })
  coverImageUrl: string | null = null;

  @Property({ nullable: true })
  pageCount: number | null = null;

  @Property()
  language: string = 'en';

  @Property()
  createdAt: Date & Opt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();

  @ManyToMany(() => Author, (author) => author.books, {
    owner: true,
    pivotTable: 'book_authors',
    joinColumn: 'book_id',
    inverseJoinColumn: 'author_id',
  })
  authors: Collection<Author> = new Collection<Author>(this);

  @ManyToMany(() => Tag, (tag) => tag.books, {
    owner: true,
    pivotTable: 'book_tags',
    joinColumn: 'book_id',
    inverseJoinColumn: 'tag_id',
  })
  tags: Collection<Tag> = new Collection<Tag>(this);
}
