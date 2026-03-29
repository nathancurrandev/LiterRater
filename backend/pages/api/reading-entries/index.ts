import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '../../../src/middleware/auth';
import { getOrm } from '../../../src/lib/orm';
import { ReadingEntryService } from '../../../src/services/ReadingEntryService';
import { ReadingStatus } from '../../../src/entities/ReadingEntry';
import { sendSuccess, sendError } from '../../../src/lib/response';

export default requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
  const orm = await getOrm();
  const em = orm.em.fork();
  const service = new ReadingEntryService(em);

  if (req.method === 'GET') {
    const page = parseInt(typeof req.query['page'] === 'string' ? req.query['page'] : '1', 10) || 1;
    const limit = Math.min(50, parseInt(typeof req.query['limit'] === 'string' ? req.query['limit'] : '20', 10) || 20);
    const bookId = typeof req.query['bookId'] === 'string' ? parseInt(req.query['bookId'], 10) : undefined;
    const statusParam = typeof req.query['status'] === 'string' ? req.query['status'] : undefined;
    const status = Object.values(ReadingStatus).includes(statusParam as ReadingStatus)
      ? (statusParam as ReadingStatus)
      : undefined;

    const { entries, total } = await service.list(req.userId, { bookId, status, page, limit });

    const data = entries.map((e) => ({
      id: e.id,
      bookId: e.book.id,
      status: e.status,
      startDate: e.startDate ? e.startDate.toISOString() : null,
      finishDate: e.finishDate ? e.finishDate.toISOString() : null,
      isReread: e.isReread,
      notes: e.notes,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }));

    res.status(200).json({
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
    return;
  }

  if (req.method === 'POST') {
    const body = req.body as {
      bookId?: unknown;
      status?: unknown;
      startDate?: unknown;
      finishDate?: unknown;
      isReread?: unknown;
      notes?: unknown;
    };

    if (typeof body.bookId !== 'number' || typeof body.status !== 'string') {
      sendError(res, 'bookId and status are required', 400);
      return;
    }

    if (!Object.values(ReadingStatus).includes(body.status as ReadingStatus)) {
      sendError(res, 'Invalid status value', 400);
      return;
    }

    try {
      const entry = await service.create(req.userId, {
        bookId: body.bookId,
        status: body.status as ReadingStatus,
        startDate: typeof body.startDate === 'string' ? body.startDate : null,
        finishDate: typeof body.finishDate === 'string' ? body.finishDate : null,
        isReread: typeof body.isReread === 'boolean' ? body.isReread : false,
        notes: typeof body.notes === 'string' ? body.notes : null,
      });

      sendSuccess(
        res,
        {
          id: entry.id,
          bookId: entry.book.id,
          status: entry.status,
          startDate: entry.startDate ? entry.startDate.toISOString() : null,
          finishDate: entry.finishDate ? entry.finishDate.toISOString() : null,
          isReread: entry.isReread,
          notes: entry.notes,
          createdAt: entry.createdAt.toISOString(),
          updatedAt: entry.updatedAt.toISOString(),
        },
        201,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      sendError(res, message, 500);
    }
    return;
  }

  sendError(res, 'Method not allowed', 405);
});
