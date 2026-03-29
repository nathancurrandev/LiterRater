import { NextApiRequest, NextApiResponse } from 'next';
import { getOrm } from '../../../src/lib/orm';
import { AuthService } from '../../../src/services/AuthService';
import { sendSuccess, sendError } from '../../../src/lib/response';
import { User } from '../../../src/entities/User';

interface UserSummary {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
}

function toUserSummary(user: User): UserSummary {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
  };
}

function buildTokenCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const parts = [
    `token=${encodeURIComponent(token)}`,
    'HttpOnly',
    'SameSite=Strict',
    'Path=/',
    'Max-Age=604800', // 7 days
  ];
  if (isProduction) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    sendError(res, 'Method not allowed', 405);
    return;
  }

  const { email, password, username, displayName } = req.body as Record<string, unknown>;

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof username !== 'string' ||
    typeof displayName !== 'string'
  ) {
    sendError(res, 'email, password, username, and displayName are required', 400);
    return;
  }

  if (!email.trim() || !password.trim() || !username.trim() || !displayName.trim()) {
    sendError(res, 'email, password, username, and displayName must not be empty', 400);
    return;
  }

  if (password.length < 8) {
    sendError(res, 'Password must be at least 8 characters', 400);
    return;
  }

  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const authService = new AuthService(em);

    const user = await authService.register(email.trim(), password, username.trim(), displayName.trim());
    const token = authService.signToken(user.id, user.role);

    res.setHeader('Set-Cookie', buildTokenCookie(token));
    sendSuccess(res, { user: toUserSummary(user) }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    if (message.includes('already taken')) {
      sendError(res, message, 409);
    } else {
      sendError(res, message, 400);
    }
  }
}
