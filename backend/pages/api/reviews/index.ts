import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '../../../src/middleware/auth';
import { getOrm } from '../../../src/lib/orm';
import { ReviewService } from '../../../src/services/ReviewService';
import { sendSuccess, sendError } from '../../../src/lib/response';

export default requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
  if (req.method !== 'POST') {
    sendError(res, 'Method not allowed', 405);
    return;
  }

  const body = req.body as { bookId?: unknown; content?: unknown; containsSpoilers?: unknown };

  if (typeof body.bookId !== 'number' || typeof body.content !== 'string') {
    sendError(res, 'bookId and content are required', 400);
    return;
  }

  const orm = await getOrm();
  const em = orm.em.fork();
  const service = new ReviewService(em);

  try {
    const review = await service.upsert(req.userId, {
      bookId: body.bookId,
      content: body.content,
      containsSpoilers: body.containsSpoilers === true,
    });

    sendSuccess(res, {
      id: review.id,
      bookId: review.book.id,
      author: {
        id: review.user.id,
        username: review.user.username,
        displayName: review.user.displayName,
        avatarUrl: review.user.avatarUrl,
        role: review.user.role,
      },
      content: review.content,
      containsSpoilers: review.containsSpoilers,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message.includes('not found') ? 404 : message.includes('cannot be empty') ? 400 : 500;
    sendError(res, message, status);
  }
});
