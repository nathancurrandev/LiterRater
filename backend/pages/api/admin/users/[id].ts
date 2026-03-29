import { NextApiResponse } from 'next';
import { requireAdmin, AuthenticatedRequest } from '../../../../src/middleware/auth';
import { getOrm } from '../../../../src/lib/orm';
import { User } from '../../../../src/entities/User';
import { sendSuccess, sendError } from '../../../../src/lib/response';

export default requireAdmin(async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
  if (req.method !== 'DELETE') {
    sendError(res, 'Method not allowed', 405);
    return;
  }

  const userId = parseInt(typeof req.query['id'] === 'string' ? req.query['id'] : '', 10);
  if (isNaN(userId)) {
    sendError(res, 'Invalid id', 400);
    return;
  }

  const orm = await getOrm();
  const em = orm.em.fork();

  try {
    const user = await em.findOneOrFail(User, userId);
    // Anonymise PII instead of deleting
    user.email = `deleted-${user.id}@anonymised.invalid`;
    user.username = `deleted-${user.id}`;
    user.displayName = 'Deleted User';
    user.bio = null;
    user.avatarUrl = null;
    user.isAnonymised = true;
    user.deletedAt = new Date();
    await em.flush();
    sendSuccess(res, { ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    sendError(res, message, message.includes('not found') ? 404 : 500);
  }
});
