import {
  Entity,
  PrimaryKey,
  Property,
  Enum,
  ManyToOne,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { User } from './User';
import type { ListItem } from './ListItem';

export enum ListVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

@Entity({ tableName: 'lists' })
export class List {
  @PrimaryKey()
  id!: number;

  @Property()
  title!: string;

  @Property({ nullable: true, type: 'text' })
  description: string | null = null;

  @Property()
  isRanked: boolean = false;

  @Enum({ items: () => ListVisibility })
  visibility: ListVisibility = ListVisibility.PUBLIC;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => User)
  owner!: User;

  @OneToMany({ entity: 'ListItem', mappedBy: 'list' })
  items: Collection<ListItem> = new Collection<ListItem>(this);
}
