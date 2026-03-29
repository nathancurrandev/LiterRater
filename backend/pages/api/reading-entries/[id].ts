import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '../../../src/middleware/auth';
import { getOrm } from '../../../src/lib/orm';
import { ReadingEntryService } from '../../../src/services/ReadingEntryService';
import { ReadingStatus } from '../../../src/entities/ReadingEntry';
import { sendSuccess, sendError } from '../../../src/lib/response';

export default requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
  const idParam = typeof req.query['id'] === 'string' ? parseInt(req.query['id'], 10) : NaN;
  if (isNaN(idParam)) {
    sendError(res, 'Invalid id', 400);
    return;
  }

  const orm = await getOrm();
  const em = orm.em.fork();
  const service = new ReadingEntryService(em);

  if (req.method === 'PATCH') {
    const body = req.body as {
      status?: unknown;
      startDate?: unknown;
      finishDate?: unknown;
      isReread?: unknown;
      notes?: unknown;
    };

    const update: Parameters<typeof service.update>[2] = {};
    if (typeof body.status === 'string' && Object.values(ReadingStatus).includes(body.status as ReadingStatus)) {
      update.status = body.status as ReadingStatus;
    }
    if ('startDate' in body) update.startDate = typeof body.startDate === 'string' ? body.startDate : null;
    if ('finishDate' in body) update.finishDate = typeof body.finishDate === 'string' ? body.finishDate : null;
    if (typeof body.isReread === 'boolean') update.isReread = body.isReread;
    if ('notes' in body) update.notes = typeof body.notes === 'string' ? body.notes : null;

    try {
      const entry = await service.update(idParam, req.userId, update);
      sendSuccess(res, {
        id: entry.id,
        bookId: entry.book.id,
        status: entry.status,
        startDate: entry.startDate ? entry.startDate.toISOString() : null,
        finishDate: entry.finishDate ? entry.finishDate.toISOString() : null,
        isReread: entry.isReread,
        notes: entry.notes,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      const status = message === 'Forbidden' ? 403 : message.includes('not found') ? 404 : 500;
      sendError(res, message, status);
    }
    return;
  }

  if (req.method === 'DELETE') {
    try {
      await service.delete(idParam, req.userId);
      sendSuccess(res, { ok: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      const status = message === 'Forbidden' ? 403 : message.includes('not found') ? 404 : 500;
      sendError(res, message, status);
    }
    return;
  }

  sendError(res, 'Method not allowed', 405);
});
