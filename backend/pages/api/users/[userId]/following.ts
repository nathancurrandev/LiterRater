import { NextApiRequest, NextApiResponse } from 'next';
import { getOrm } from '../../../../src/lib/orm';
import { FollowService } from '../../../../src/services/FollowService';
import { sendError } from '../../../../src/lib/response';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    sendError(res, 'Method not allowed', 405);
    return;
  }

  const userId = parseInt(typeof req.query['userId'] === 'string' ? req.query['userId'] : '', 10);
  if (isNaN(userId)) {
    sendError(res, 'Invalid userId', 400);
    return;
  }

  const orm = await getOrm();
  const em = orm.em.fork();
  const service = new FollowService(em);
  const following = await service.getFollowing(userId);

  res.status(200).json({
    data: following.map((u) => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      role: u.role,
    })),
  });
}
