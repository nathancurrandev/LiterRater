import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '../../../src/middleware/auth';
import { getOrm } from '../../../src/lib/orm';
import { ListService } from '../../../src/services/ListService';
import { ListVisibility } from '../../../src/entities/List';
import { sendSuccess, sendError } from '../../../src/lib/response';

function toListDetail(list: { id: number; title: string; description: string | null; isRanked: boolean; visibility: ListVisibility; createdAt: Date; updatedAt?: Date; owner: { id: number; username: string; displayName: string; avatarUrl: string | null; role: string }; items: Iterable<{ book: { id: number; title: string; coverImageUrl: string | null; authors: Iterable<{ id: number; name: string }>; averageRating?: number | null; ratingCount?: number }; position: number | null; notes: string | null }> }) {
  const items = [...list.items].map((item) => ({
    bookId: item.book.id,
    book: {
      id: item.book.id,
      title: item.book.title,
      coverImageUrl: item.book.coverImageUrl,
      authors: [...item.book.authors].map((a) => ({ id: a.id, name: a.name })),
      averageRating: item.book.averageRating ?? null,
      ratingCount: item.book.ratingCount ?? 0,
    },
    position: item.position,
    notes: item.notes,
  }));

  return {
    id: list.id,
    title: list.title,
    description: list.description,
    isRanked: list.isRanked,
    visibility: list.visibility,
    itemCount: items.length,
    owner: {
      id: list.owner.id,
      username: list.owner.username,
      displayName: list.owner.displayName,
      avatarUrl: list.owner.avatarUrl,
      role: list.owner.role,
    },
    createdAt: list.createdAt.toISOString(),
    items: list.isRanked ? items.sort((a, b) => (a.position ?? 999) - (b.position ?? 999)) : items,
  };
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, listId: number): Promise<void> {
  const orm = await getOrm();
  const em = orm.em.fork();
  const service = new ListService(em);

  const userId = (req as NextApiRequest & { userId?: number }).userId;

  try {
    const list = await service.getById(listId, userId);
    sendSuccess(res, toListDetail(list));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message === 'Forbidden' ? 403 : message.includes('not found') ? 404 : 500;
    sendError(res, message, status);
  }
}

async function handlePatch(req: AuthenticatedRequest, res: NextApiResponse, listId: number): Promise<void> {
  const body = req.body as { title?: unknown; description?: unknown; isRanked?: unknown; visibility?: unknown };
  const visibilityValues = Object.values(ListVisibility);

  const data: Parameters<ListService['update']>[2] = {};
  if (typeof body.title === 'string') data.title = body.title;
  if ('description' in body) data.description = typeof body.description === 'string' ? body.description : null;
  if (typeof body.isRanked === 'boolean') data.isRanked = body.isRanked;
  if (typeof body.visibility === 'string' && visibilityValues.includes(body.visibility as ListVisibility)) {
    data.visibility = body.visibility as ListVisibility;
  }

  const orm = await getOrm();
  const em = orm.em.fork();
  const service = new ListService(em);

  try {
    const list = await service.update(listId, req.userId, data);
    sendSuccess(res, toListDetail(list));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message === 'Forbidden' ? 403 : message.includes('not found') ? 404 : 500;
    sendError(res, message, status);
  }
}

async function handleDelete(req: AuthenticatedRequest, res: NextApiResponse, listId: number): Promise<void> {
  const orm = await getOrm();
  const em = orm.em.fork();
  const service = new ListService(em);

  try {
    await service.delete(listId, req.userId);
    sendSuccess(res, { ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message === 'Forbidden' ? 403 : message.includes('not found') ? 404 : 500;
    sendError(res, message, status);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const listId = parseInt(typeof req.query['id'] === 'string' ? req.query['id'] : '', 10);
  if (isNaN(listId)) {
    sendError(res, 'Invalid id', 400);
    return;
  }

  if (req.method === 'GET') {
    await handleGet(req, res, listId);
    return;
  }

  if (req.method === 'PATCH' || req.method === 'DELETE') {
    return requireAuth(async (authReq: AuthenticatedRequest, authRes: NextApiResponse) => {
      if (req.method === 'PATCH') {
        await handlePatch(authReq, authRes, listId);
      } else {
        await handleDelete(authReq, authRes, listId);
      }
    })(req, res);
  }

  sendError(res, 'Method not allowed', 405);
}
