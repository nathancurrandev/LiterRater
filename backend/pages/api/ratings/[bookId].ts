import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '../../../src/middleware/auth';
import { getOrm } from '../../../src/lib/orm';
import { RatingService } from '../../../src/services/RatingService';
import { sendSuccess, sendError } from '../../../src/lib/response';

export default requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
  if (req.method !== 'DELETE') {
    sendError(res, 'Method not allowed', 405);
    return;
  }

  const bookId = parseInt(typeof req.query['bookId'] === 'string' ? req.query['bookId'] : '', 10);
  if (isNaN(bookId)) {
    sendError(res, 'Invalid bookId', 400);
    return;
  }

  const orm = await getOrm();
  const em = orm.em.fork();
  const service = new RatingService(em);

  try {
    await service.delete(req.userId, bookId);
    sendSuccess(res, { ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message.includes('not found') ? 404 : 500;
    sendError(res, message, status);
  }
});
