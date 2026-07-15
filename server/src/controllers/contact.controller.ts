import type { Request, Response } from 'express';
import type { ContactMessageInput } from '../schemas/contact.schema';
import { processContactMessage } from '../services/contact.service';

export async function createContactMessage(req: Request, res: Response): Promise<void> {
  const payload = req.body as ContactMessageInput;
  const result = await processContactMessage(payload);

  res.status(201).json({
    success: true,
    data: result,
  });
}
