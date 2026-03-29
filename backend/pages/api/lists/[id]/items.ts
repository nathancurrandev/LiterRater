import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '../../../../src/middleware/auth';
import { getOrm } from '../../../../src/lib/orm';
import { ListService } from '../../../../src/services/ListService';
import { sendSuccess, sendError } from '../../../../src/lib/response';

export default requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
  const listId = parseInt(typeof req.query['id'] === 'string' ? req.query['id'] : '', 10);
  if (isNaN(listId)) {
    sendError(res, 'Invalid list id', 400);
    return;
  }

  const orm = await getOrm();
  const em = orm.em.fork();
  const service = new ListService(em);

  if (req.method === 'POST') {
    const body = req.body as { bookId?: unknown; position?: unknown; notes?: unknown };
    if (typeof body.bookId !== 'number') {
      sendError(res, 'bookId is required', 400);
      return;
    }
    try {
      const item = await service.addItem(
        listId,
        req.userId,
        body.bookId,
        typeof body.position === 'number' ? body.position : null,
        typeof body.notes === 'string' ? body.notes : null,
      );
      sendSuccess(res, { bookId: item.book.id, position: item.position, notes: item.notes }, 201);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      const status = message === 'Forbidden' ? 403 : message.includes('already in') ? 409 : message.includes('not found') ? 404 : 500;
      sendError(res, message, status);
    }
    return;
  }

  if (req.method === 'PATCH') {
    const body = req.body as { bookId?: unknown; position?: unknown; notes?: unknown };
    if (typeof body.bookId !== 'number') {
      sendError(res, 'bookId is required', 400);
      return;
    }
    try {
      const item = await service.updateItem(listId, req.userId, body.bookId, {
        position: typeof body.position === 'number' ? body.position : null,
        notes: typeof body.notes === 'string' ? body.notes : null,
      });
      sendSuccess(res, { bookId: item.book.id, position: item.position, notes: item.notes });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      sendError(res, message, message === 'Forbidden' ? 403 : 500);
    }
    return;
  }

  if (req.method === 'DELETE') {
    const bookId = typeof req.query['bookId'] === 'string' ? parseInt(req.query['bookId'], 10) : NaN;
    if (isNaN(bookId)) {
      sendError(res, 'bookId query param required', 400);
      return;
    }
    try {
      await service.removeItem(listId, req.userId, bookId);
      sendSuccess(res, { ok: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      sendError(res, message, message === 'Forbidden' ? 403 : 500);
    }
    return;
  }

  sendError(res, 'Method not allowed', 405);
});
