import { defineConfig } from '@mikro-orm/mysql';
import { Migrator } from '@mikro-orm/migrations';
import { Activity } from './src/entities/Activity';
import { Author } from './src/entities/Author';
import { Book } from './src/entities/Book';
import { Follow } from './src/entities/Follow';
import { List } from './src/entities/List';
import { ListItem } from './src/entities/ListItem';
import { Rating } from './src/entities/Rating';
import { ReadingEntry } from './src/entities/ReadingEntry';
import { Review } from './src/entities/Review';
import { Tag } from './src/entities/Tag';
import { User } from './src/entities/User';

export default defineConfig({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'literrater',
  password: process.env.DB_PASSWORD ?? 'password',
  dbName: process.env.DB_NAME ?? 'literrater',
  entities: [Activity, Author, Book, Follow, List, ListItem, Rating, ReadingEntry, Review, Tag, User],
  entitiesTs: [Activity, Author, Book, Follow, List, ListItem, Rating, ReadingEntry, Review, Tag, User],
  migrations: {
    path: './migrations',
    pathTs: './migrations',
  },
  extensions: [Migrator],
  debug: process.env.NODE_ENV === 'development',
});
