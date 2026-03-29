import { NextApiResponse } from 'next';

export function sendSuccess<T>(res: NextApiResponse, data: T, status = 200): void {
  res.status(status).json({ data });
}

export function sendError(res: NextApiResponse, message: string, status: number): void {
  res.status(status).json({ error: message });
}
