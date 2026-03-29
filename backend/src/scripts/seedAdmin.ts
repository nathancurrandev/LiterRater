import { MikroORM } from '@mikro-orm/core';
import bcrypt from 'bcrypt';
import config from '../../mikro-orm.config';
import { User, UserRole } from '../entities/User';

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? 'admin@literrater.dev';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'changeme123';
const ADMIN_NAME     = process.env.ADMIN_NAME     ?? 'Admin';

async function seedAdmin(): Promise<void> {
  const orm = await MikroORM.init(config);
  const em  = orm.em.fork();

  const existing = await em.findOne(User, { email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
    await orm.close();
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const now = new Date();

  em.create(User, {
    email:        ADMIN_EMAIL,
    username:     ADMIN_USERNAME,
    displayName:  ADMIN_NAME,
    passwordHash,
    role:         UserRole.ADMIN,
    isAnonymised: false,
    createdAt:    now,
  });

  await em.flush();
  console.log(`Admin user created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

  await orm.close();
}

seedAdmin().catch((err: unknown) => {
  console.error('seedAdmin failed:', err);
  process.exit(1);
});
