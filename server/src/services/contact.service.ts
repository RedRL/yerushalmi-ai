import { randomUUID } from 'node:crypto';
import { sendContactMessageEmail } from './email.service';
import type { ContactMessageInput } from '../schemas/contact.schema';

export interface ContactMessageResult {
  messageId: string;
  email: Awaited<ReturnType<typeof sendContactMessageEmail>>;
}

export async function processContactMessage(payload: ContactMessageInput): Promise<ContactMessageResult> {
  const submittedAt = new Date();
  const email = await sendContactMessageEmail(payload, submittedAt);

  return {
    messageId: randomUUID(),
    email,
  };
}
