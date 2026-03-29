import { NextApiResponse } from 'next';
import { requireAdmin, AuthenticatedRequest } from '../../../../src/middleware/auth';
import { getOrm } from '../../../../src/lib/orm';
import { Author } from '../../../../src/entities/Author';
import { sendSuccess, sendError } from '../../../../src/lib/response';

export default requireAdmin(async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
  if (req.method !== 'PATCH') {
    sendError(res, 'Method not allowed', 405);
    return;
  }

  const authorId = parseInt(typeof req.query['id'] === 'string' ? req.query['id'] : '', 10);
  if (isNaN(authorId)) {
    sendError(res, 'Invalid id', 400);
    return;
  }

  const orm = await getOrm();
  const em = orm.em.fork();
  const body = req.body as { name?: unknown; bio?: unknown; birthYear?: unknown; nationality?: unknown };

  try {
    const author = await em.findOneOrFail(Author, authorId);
    if (typeof body.name === 'string') author.name = body.name;
    if ('bio' in body) author.bio = typeof body.bio === 'string' ? body.bio : null;
    if ('birthYear' in body) author.birthYear = typeof body.birthYear === 'number' ? body.birthYear : null;
    if ('nationality' in body) author.nationality = typeof body.nationality === 'string' ? body.nationality : null;
    await em.flush();
    sendSuccess(res, { id: author.id, name: author.name, bio: author.bio, birthYear: author.birthYear, nationality: author.nationality });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    sendError(res, message, message.includes('not found') ? 404 : 500);
  }
});
