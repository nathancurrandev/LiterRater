import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { EntityManager } from '@mikro-orm/core';
import { User, UserRole } from '../entities/User';

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

interface TokenPayload {
  userId: number;
  role: UserRole;
}

export type { TokenPayload };

function isTokenPayload(value: unknown): value is TokenPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'userId' in value &&
    'role' in value &&
    typeof (value as Record<string, unknown>).userId === 'number' &&
    typeof (value as Record<string, unknown>).role === 'string'
  );
}

export class AuthService {
  constructor(private readonly em: EntityManager) {}

  async register(
    email: string,
    password: string,
    username: string,
    displayName: string,
  ): Promise<User> {
    const existingEmail = await this.em.findOne(User, { email });
    if (existingEmail) {
      throw new Error('Email already taken');
    }

    const existingUsername = await this.em.findOne(User, { username });
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = this.em.create(User, {
      email,
      passwordHash,
      username,
      displayName,
    });

    await this.em.persistAndFlush(user);
    return user;
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: User; token: string }> {
    const user = await this.em.findOne(User, { email });

    if (!user || user.isAnonymised) {
      throw new Error('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new Error('Invalid credentials');
    }

    const token = this.signToken(user.id, user.role);
    return { user, token };
  }

  signToken(userId: number, role: UserRole): string {
    return jwt.sign({ userId, role } satisfies TokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  verifyToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!isTokenPayload(decoded)) {
      throw new Error('Invalid token payload');
    }
    return decoded;
  }

  async anonymiseUser(userId: number): Promise<void> {
    const user = await this.em.findOneOrFail(User, { id: userId });

    user.isAnonymised = true;
    user.deletedAt = new Date();
    user.email = `deleted-${userId}@deleted.invalid`;
    user.passwordHash = '';
    user.username = `deleted-${userId}`;
    user.displayName = 'Deleted User';
    user.bio = null;
    user.avatarUrl = null;

    await this.em.flush();
  }
}
