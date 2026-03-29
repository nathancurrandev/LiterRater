import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '../../../src/middleware/auth';
import { getOrm } from '../../../src/lib/orm';
import { ListService } from '../../../src/services/ListService';
import { ListVisibility } from '../../../src/entities/List';
import { sendSuccess, sendError } from '../../../src/lib/response';

function toListSummary(list: { id: number; title: string; description: string | null; isRanked: boolean; visibility: ListVisibility; createdAt: Date; owner: { id: number; username: string; displayName: string; avatarUrl: string | null; role: string }; items: { length?: number } | { isInitialized: () => boolean; count: () => number } }) {
  const itemCount = 'length' in list.items
    ? (list.items as unknown[]).length
    : (list.items as { isInitialized: () => boolean; count: () => number }).isInitialized()
    ? (list.items as { count: () => number }).count()
    : 0;

  return {
    id: list.id,
    title: list.title,
    description: list.description,
    isRanked: list.isRanked,
    visibility: list.visibility,
    itemCount,
    owner: {
      id: list.owner.id,
      username: list.owner.username,
      displayName: list.owner.displayName,
      avatarUrl: list.owner.avatarUrl,
      role: list.owner.role,
    },
    createdAt: list.createdAt.toISOString(),
  };
}

export default requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
  if (req.method !== 'POST') {
    sendError(res, 'Method not allowed', 405);
    return;
  }

  const body = req.body as {
    title?: unknown;
    description?: unknown;
    isRanked?: unknown;
    visibility?: unknown;
  };

  if (typeof body.title !== 'string' || !body.title.trim()) {
    sendError(res, 'title is required', 400);
    return;
  }

  const visibilityValues = Object.values(ListVisibility);
  const visibility =
    typeof body.visibility === 'string' && visibilityValues.includes(body.visibility as ListVisibility)
      ? (body.visibility as ListVisibility)
      : ListVisibility.PUBLIC;

  const orm = await getOrm();
  const em = orm.em.fork();
  const service = new ListService(em);

  try {
    const list = await service.create(req.userId, {
      title: body.title,
      description: typeof body.description === 'string' ? body.description : null,
      isRanked: body.isRanked === true,
      visibility,
    });
    sendSuccess(res, toListSummary(list), 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    sendError(res, message, 500);
  }
});
