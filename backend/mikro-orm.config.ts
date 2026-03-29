import { defineConfig } from '@mikro-orm/mysql';
import { Migrator } from '@mikro-orm/migrations';

export default defineConfig({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'literrater',
  password: process.env.DB_PASSWORD ?? 'password',
  dbName: process.env.DB_NAME ?? 'literrater',
  entities: ['./src/entities/**/*.ts'],
  entitiesTs: ['./src/entities/**/*.ts'],
  migrations: {
    path: './migrations',
    pathTs: './migrations',
  },
  extensions: [Migrator],
  debug: process.env.NODE_ENV === 'development',
});
