import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';

export enum UserRole {
  MEMBER = 'member',
  ADMIN = 'admin',
}

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  email!: string;

  @Property()
  passwordHash!: string;

  @Property({ unique: true })
  username!: string;

  @Property()
  displayName!: string;

  @Property({ nullable: true, type: 'text' })
  bio: string | null = null;

  @Property({ nullable: true })
  avatarUrl: string | null = null;

  @Enum({ items: () => UserRole })
  role: UserRole = UserRole.MEMBER;

  @Property()
  isAnonymised: boolean = false;

  @Property()
  createdAt: Date = new Date();

  @Property({ nullable: true })
  deletedAt: Date | null = null;
}
