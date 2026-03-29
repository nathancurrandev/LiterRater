import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '../../../src/middleware/auth';
import { getOrm } from '../../../src/lib/orm';
import { FollowService } from '../../../src/services/FollowService';
import { sendSuccess, sendError } from '../../../src/lib/response';

export default requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
  const targetId = parseInt(typeof req.query['userId'] === 'string' ? req.query['userId'] : '', 10);
  if (isNaN(targetId)) {
    sendError(res, 'Invalid userId', 400);
    return;
  }

  const orm = await getOrm();
  const em = orm.em.fork();
  const service = new FollowService(em);

  if (req.method === 'POST') {
    try {
      await service.follow(req.userId, targetId);
      sendSuccess(res, { ok: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      const status = message.includes('yourself') ? 400 : message.includes('not found') ? 404 : 500;
      sendError(res, message, status);
    }
    return;
  }

  if (req.method === 'DELETE') {
    await service.unfollow(req.userId, targetId);
    sendSuccess(res, { ok: true });
    return;
  }

  sendError(res, 'Method not allowed', 405);
});
