import { NextApiRequest, NextApiResponse } from 'next';
import { getOrm } from '../../../../src/lib/orm';
import { ReviewService } from '../../../../src/services/ReviewService';
import { sendError } from '../../../../src/lib/response';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    sendError(res, 'Method not allowed', 405);
    return;
  }

  const bookId = parseInt(typeof req.query['id'] === 'string' ? req.query['id'] : '', 10);
  if (isNaN(bookId)) {
    sendError(res, 'Invalid book id', 400);
    return;
  }

  const page = parseInt(typeof req.query['page'] === 'string' ? req.query['page'] : '1', 10) || 1;
  const limit = Math.min(50, parseInt(typeof req.query['limit'] === 'string' ? req.query['limit'] : '20', 10) || 20);

  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const service = new ReviewService(em);
    const { reviews, total } = await service.listForBook(bookId, page, limit);

    res.status(200).json({
      data: reviews.map((r) => ({
        id: r.id,
        bookId: r.book.id,
        author: {
          id: r.user.id,
          username: r.user.username,
          displayName: r.user.displayName,
          avatarUrl: r.user.avatarUrl,
          role: r.user.role,
        },
        content: r.content,
        containsSpoilers: r.containsSpoilers,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    sendError(res, message, 500);
  }
}
