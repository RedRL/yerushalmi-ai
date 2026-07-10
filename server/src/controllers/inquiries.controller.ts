import type { Request, Response } from 'express';
import type { InquiryInput } from '../schemas/inquiry.schema';
import { processInquiry } from '../services/inquiry.service';

export async function createInquiry(req: Request, res: Response): Promise<void> {
  const payload = req.body as InquiryInput;
  const result = await processInquiry(payload);

  res.status(201).json({
    success: true,
    data: result,
  });
}
