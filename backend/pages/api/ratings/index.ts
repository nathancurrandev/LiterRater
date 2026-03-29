import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '../../../src/middleware/auth';
import { getOrm } from '../../../src/lib/orm';
import { RatingService } from '../../../src/services/RatingService';
import { sendSuccess, sendError } from '../../../src/lib/response';

export default requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
  if (req.method !== 'POST') {
    sendError(res, 'Method not allowed', 405);
    return;
  }

  const body = req.body as { bookId?: unknown; score?: unknown };

  if (typeof body.bookId !== 'number' || typeof body.score !== 'number') {
    sendError(res, 'bookId and score are required', 400);
    return;
  }

  const orm = await getOrm();
  const em = orm.em.fork();
  const service = new RatingService(em);

  try {
    const rating = await service.upsert(req.userId, body.bookId, body.score);
    sendSuccess(
      res,
      {
        id: rating.id,
        bookId: rating.book.id,
        score: rating.score as 1 | 2 | 3 | 4 | 5,
        createdAt: rating.createdAt.toISOString(),
        updatedAt: rating.updatedAt.toISOString(),
      },
      200,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message.includes('not found') ? 404 : message.includes('Score') ? 400 : 500;
    sendError(res, message, status);
  }
});
