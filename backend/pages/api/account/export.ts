import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '../../../src/middleware/auth';
import { getOrm } from '../../../src/lib/orm';
import { GdprService } from '../../../src/services/GdprService';
import { sendError } from '../../../src/lib/response';

export default requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
  if (req.method !== 'GET') {
    sendError(res, 'Method not allowed', 405);
    return;
  }

  const orm = await getOrm();
  const em = orm.em.fork();
  const gdprService = new GdprService(em);

  try {
    const data = await gdprService.exportUserData(req.userId);
    const json = JSON.stringify(data, null, 2);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="my-literrater-data.json"');
    res.status(200).send(json);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    sendError(res, message, 500);
  }
});
