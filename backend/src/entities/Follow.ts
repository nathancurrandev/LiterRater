import { Entity, PrimaryKey, Property, ManyToOne, Unique } from '@mikro-orm/core';
import { User } from './User';

@Entity({ tableName: 'follows' })
@Unique({ properties: ['follower', 'following'] })
export class Follow {
  @PrimaryKey()
  id!: number;

  @Property()
  createdAt: Date = new Date();

  @ManyToOne(() => User)
  follower!: User;

  @ManyToOne(() => User)
  following!: User;
}
