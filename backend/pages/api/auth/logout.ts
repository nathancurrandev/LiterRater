import { NextApiRequest, NextApiResponse } from 'next';
import { sendSuccess, sendError } from '../../../src/lib/response';

const CLEAR_COOKIE = 'token=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0';

export default function handler(req: NextApiRequest, res: NextApiResponse): void {
  if (req.method !== 'POST') {
    sendError(res, 'Method not allowed', 405);
    return;
  }

  res.setHeader('Set-Cookie', CLEAR_COOKIE);
  sendSuccess(res, { ok: true });
}
