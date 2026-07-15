import { z } from 'zod';

export const contactMessageSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  phone: z.string().trim().min(7, 'Phone is required').max(20),
  email: z.string().trim().email('Valid email is required').max(200),
  message: z.string().trim().min(1, 'Message is required').max(5000),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
