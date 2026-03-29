import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '../../../src/middleware/auth';
import { getOrm } from '../../../src/lib/orm';
import { AuthService } from '../../../src/services/AuthService';
import { sendSuccess, sendError } from '../../../src/lib/response';
import bcrypt from 'bcrypt';
import { User } from '../../../src/entities/User';

export default requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
  if (req.method !== 'DELETE') {
    sendError(res, 'Method not allowed', 405);
    return;
  }

  const body = req.body as { password?: unknown };
  if (typeof body.password !== 'string') {
    sendError(res, 'password is required for confirmation', 400);
    return;
  }

  const orm = await getOrm();
  const em = orm.em.fork();

  try {
    const user = await em.findOneOrFail(User, req.userId);
    const passwordMatches = await bcrypt.compare(body.password, user.passwordHash);
    if (!passwordMatches) {
      sendError(res, 'Incorrect password', 403);
      return;
    }

    const authService = new AuthService(em);
    await authService.anonymiseUser(req.userId);

    res.setHeader('Set-Cookie', 'token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax');
    sendSuccess(res, { ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    sendError(res, message, 500);
  }
});
