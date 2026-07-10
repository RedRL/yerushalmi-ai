import type { Request, Response } from 'express';
import type { InitiateUploadInput, CompleteUploadInput } from '../schemas/upload.schema';
import { getStorageService } from '../storage/storage.factory';

export async function initiateUpload(req: Request, res: Response): Promise<void> {
  const input = req.body as InitiateUploadInput;
  const storage = getStorageService();
  const result = await storage.initiateUpload(input);

  res.status(200).json({ success: true, data: result });
}

export async function completeUpload(req: Request, res: Response): Promise<void> {
  const input = req.body as CompleteUploadInput;
  const storage = getStorageService();
  const result = await storage.completeUpload(input.storageKey);

  res.status(200).json({ success: true, data: result });
}
