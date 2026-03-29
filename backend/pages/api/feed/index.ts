import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '../../../src/middleware/auth';
import { getOrm } from '../../../src/lib/orm';
import { ActivityService } from '../../../src/services/ActivityService';
import { sendSuccess, sendError } from '../../../src/lib/response';

function toBookSummary(book: { id: number; title: string; coverImageUrl: string | null; authors: Iterable<{ id: number; name: string }> } | null) {
  if (!book) return undefined;
  return {
    id: book.id,
    title: book.title,
    coverImageUrl: book.coverImageUrl,
    authors: [...book.authors].map((a) => ({ id: a.id, name: a.name })),
    averageRating: null,
    ratingCount: 0,
  };
}

export default requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
  if (req.method !== 'GET') {
    sendError(res, 'Method not allowed', 405);
    return;
  }

  const page = parseInt(typeof req.query['page'] === 'string' ? req.query['page'] : '1', 10) || 1;
  const limit = Math.min(50, parseInt(typeof req.query['limit'] === 'string' ? req.query['limit'] : '20', 10) || 20);

  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const service = new ActivityService(em);
    const { activities, total } = await service.getFeedForUser(req.userId, page, limit);

    res.status(200).json({
      data: activities.map((a) => ({
        id: a.id,
        type: a.type,
        actor: {
          id: a.actor.id,
          username: a.actor.username,
          displayName: a.actor.displayName,
          avatarUrl: a.actor.avatarUrl,
          role: a.actor.role,
        },
        book: toBookSummary(a.book),
        review: a.review
          ? {
              id: a.review.id,
              bookId: a.review.book.id,
              author: {
                id: a.review.user.id,
                username: a.review.user.username,
                displayName: a.review.user.displayName,
                avatarUrl: a.review.user.avatarUrl,
                role: a.review.user.role,
              },
              content: a.review.content,
              containsSpoilers: a.review.containsSpoilers,
              createdAt: a.review.createdAt.toISOString(),
              updatedAt: a.review.updatedAt.toISOString(),
            }
          : undefined,
        list: a.list
          ? {
              id: a.list.id,
              title: a.list.title,
              description: a.list.description,
              isRanked: a.list.isRanked,
              visibility: a.list.visibility,
              itemCount: 0,
              owner: {
                id: a.list.owner.id,
                username: a.list.owner.username,
                displayName: a.list.owner.displayName,
                avatarUrl: a.list.owner.avatarUrl,
                role: a.list.owner.role,
              },
              createdAt: a.list.createdAt.toISOString(),
            }
          : undefined,
        createdAt: a.createdAt.toISOString(),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    sendError(res, message, 500);
  }
});
