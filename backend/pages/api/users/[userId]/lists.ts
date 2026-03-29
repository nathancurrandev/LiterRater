import { NextApiRequest, NextApiResponse } from 'next';
import { getOrm } from '../../../../src/lib/orm';
import { ListService } from '../../../../src/services/ListService';
import { AuthService } from '../../../../src/services/AuthService';
import { sendError } from '../../../../src/lib/response';

function parseCookieHeader(header: string | undefined): Record<string, string> {
  if (!header) return {};
  const result: Record<string, string> = {};
  for (const pair of header.split(';')) {
    const eq = pair.indexOf('=');
    if (eq === -1) continue;
    const key = pair.slice(0, eq).trim();
    const value = decodeURIComponent(pair.slice(eq + 1).trim());
    if (key) result[key] = value;
  }
  return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    sendError(res, 'Method not allowed', 405);
    return;
  }

  const userId = parseInt(typeof req.query['userId'] === 'string' ? req.query['userId'] : '', 10);
  if (isNaN(userId)) {
    sendError(res, 'Invalid userId', 400);
    return;
  }

  let requestingUserId: number | undefined;
  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const cookies = parseCookieHeader(req.headers.cookie);
    const token = cookies['token'];
    if (token) {
      const authService = new AuthService(em);
      const payload = authService.verifyToken(token);
      requestingUserId = payload.userId;
    }
  } catch {
    // unauthenticated — show only public lists
  }

  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const service = new ListService(em);
    const lists = await service.getForUser(userId, requestingUserId);

    res.status(200).json({
      data: lists.map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        isRanked: l.isRanked,
        visibility: l.visibility,
        itemCount: l.items.isInitialized() ? l.items.count() : 0,
        owner: {
          id: l.owner.id,
          username: l.owner.username,
          displayName: l.owner.displayName,
          avatarUrl: l.owner.avatarUrl,
          role: l.owner.role,
        },
        createdAt: l.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    sendError(res, message, 500);
  }
}
