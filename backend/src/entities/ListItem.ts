import { Entity, PrimaryKey, Property, ManyToOne, Unique } from '@mikro-orm/core';
import { List } from './List';
import { Book } from './Book';

@Entity({ tableName: 'list_items' })
@Unique({ properties: ['list', 'book'] })
export class ListItem {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true })
  position: number | null = null;

  @Property({ nullable: true, type: 'text' })
  notes: string | null = null;

  @ManyToOne(() => List)
  list!: List;

  @ManyToOne(() => Book)
  book!: Book;
}
