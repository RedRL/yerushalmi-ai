import type { Request, Response } from 'express';

export function getHealth(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'ok',
    service: 'yerushalmi-ai-server',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
  });
}
