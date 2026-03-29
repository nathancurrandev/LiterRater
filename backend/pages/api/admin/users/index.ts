import { NextApiResponse } from 'next';
import { requireAdmin, AuthenticatedRequest } from '../../../../src/middleware/auth';
import { getOrm } from '../../../../src/lib/orm';
import { User } from '../../../../src/entities/User';
import { sendError } from '../../../../src/lib/response';

export default requireAdmin(async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
  if (req.method !== 'GET') {
    sendError(res, 'Method not allowed', 405);
    return;
  }

  const orm = await getOrm();
  const em = orm.em.fork();
  const q = typeof req.query['q'] === 'string' ? req.query['q'] : '';
  const page = parseInt(typeof req.query['page'] === 'string' ? req.query['page'] : '1', 10) || 1;
  const limit = Math.min(50, parseInt(typeof req.query['limit'] === 'string' ? req.query['limit'] : '20', 10) || 20);
  const offset = (page - 1) * limit;

  const where = q ? { username: { $like: `%${q}%` } } : {};
  const [users, total] = await em.findAndCount(User, where, { limit, offset });

  res.status(200).json({
    data: users.map((u) => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      role: u.role,
    })),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
