import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '../../../src/middleware/auth';
import { getOrm } from '../../../src/lib/orm';
import { User } from '../../../src/entities/User';
import { sendSuccess, sendError } from '../../../src/lib/response';

interface UserSummary {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
}

function toUserSummary(user: User): UserSummary {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
  };
}

export default requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
  if (req.method !== 'GET') {
    sendError(res, 'Method not allowed', 405);
    return;
  }

  const orm = await getOrm();
  const em = orm.em.fork();
  const user = await em.findOne(User, { id: req.userId });

  if (!user || user.isAnonymised) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  sendSuccess(res, { user: toUserSummary(user) });
});
