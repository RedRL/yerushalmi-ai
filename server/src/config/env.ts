import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_ORIGIN: z.string().default('http://localhost:4200'),
  RESEND_API_KEY: z.string().optional().default(''),
  CONTACT_EMAIL: z.string().optional().default(''),
  EMAIL_FROM: z.string().optional().default(''),
  STORAGE_PROVIDER: z.enum(['mock', 'r2', 's3', 'cloudinary']).default('mock'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

const raw = parsed.data;

export const env = {
  port: raw.PORT,
  nodeEnv: raw.NODE_ENV,
  isProduction: raw.NODE_ENV === 'production',
  /** Supports a comma-separated list of allowed origins. */
  clientOrigins: raw.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean),
  resendApiKey: raw.RESEND_API_KEY,
  contactEmail: raw.CONTACT_EMAIL,
  emailFrom: raw.EMAIL_FROM,
  storageProvider: raw.STORAGE_PROVIDER,
  /** Email delivery is only fully configured when all three values are present. */
  get isEmailConfigured(): boolean {
    return Boolean(this.resendApiKey && this.contactEmail && this.emailFrom);
  },
};
