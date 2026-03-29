import { NextApiResponse } from 'next';
import { requireAdmin, AuthenticatedRequest } from '../../../../src/middleware/auth';
import { getOrm } from '../../../../src/lib/orm';
import { Author } from '../../../../src/entities/Author';
import { sendSuccess, sendError } from '../../../../src/lib/response';

export default requireAdmin(async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
  const orm = await getOrm();
  const em = orm.em.fork();

  if (req.method === 'GET') {
    const q = typeof req.query['q'] === 'string' ? req.query['q'] : '';
    const page = parseInt(typeof req.query['page'] === 'string' ? req.query['page'] : '1', 10) || 1;
    const limit = Math.min(50, parseInt(typeof req.query['limit'] === 'string' ? req.query['limit'] : '20', 10) || 20);
    const offset = (page - 1) * limit;

    const where = q ? { name: { $like: `%${q}%` } } : {};
    const [authors, total] = await em.findAndCount(Author, where, { limit, offset });

    res.status(200).json({
      data: authors.map((a) => ({ id: a.id, name: a.name, bio: a.bio, birthYear: a.birthYear, nationality: a.nationality })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
    return;
  }

  if (req.method === 'POST') {
    const body = req.body as { name?: unknown; bio?: unknown; birthYear?: unknown; nationality?: unknown };
    if (typeof body.name !== 'string' || !body.name.trim()) {
      sendError(res, 'name is required', 400);
      return;
    }
    const author = em.create(Author, {
      name: body.name,
      bio: typeof body.bio === 'string' ? body.bio : null,
      birthYear: typeof body.birthYear === 'number' ? body.birthYear : null,
      nationality: typeof body.nationality === 'string' ? body.nationality : null,
    });
    await em.persistAndFlush(author);
    sendSuccess(res, { id: author.id, name: author.name, bio: author.bio, birthYear: author.birthYear, nationality: author.nationality }, 201);
    return;
  }

  sendError(res, 'Method not allowed', 405);
});
