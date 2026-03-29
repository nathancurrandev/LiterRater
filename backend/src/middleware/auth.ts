import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { AuthService } from '../services/AuthService';
import { UserRole } from '../entities/User';
import { getOrm } from '../lib/orm';
import { sendError } from '../lib/response';

export interface AuthenticatedRequest extends NextApiRequest {
  userId: number;
  userRole: UserRole;
}

function parseCookieHeader(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  for (const pair of cookieHeader.split(';')) {
    const eqIndex = pair.indexOf('=');
    if (eqIndex === -1) continue;
    const key = pair.slice(0, eqIndex).trim();
    const value = decodeURIComponent(pair.slice(eqIndex + 1).trim());
    if (key) result[key] = value;
  }
  return result;
}

export function requireAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void,
): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const cookies = parseCookieHeader(req.headers.cookie);
    const token = cookies['token'];

    if (!token) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    try {
      const orm = await getOrm();
      const em = orm.em.fork();
      const authService = new AuthService(em);
      const payload = authService.verifyToken(token);

      (req as AuthenticatedRequest).userId = payload.userId;
      (req as AuthenticatedRequest).userRole = payload.role;

      return handler(req as AuthenticatedRequest, res);
    } catch {
      sendError(res, 'Unauthorized', 401);
    }
  };
}

export function requireAdmin(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void,
): NextApiHandler {
  return requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
    if (req.userRole !== UserRole.ADMIN) {
      sendError(res, 'Forbidden', 403);
      return;
    }
    return handler(req, res);
  });
}
