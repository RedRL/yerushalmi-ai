import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

const R2_ENV_KEYS = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_BASE_URL',
] as const;

const envSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    CLIENT_ORIGIN: z.string().default('http://localhost:4200'),
    RESEND_API_KEY: z.string().optional().default(''),
    CONTACT_EMAIL: z.string().optional().default(''),
    EMAIL_FROM: z.string().optional().default(''),
    STORAGE_PROVIDER: z.enum(['mock', 'r2', 's3', 'cloudinary']).default('mock'),
    R2_ACCOUNT_ID: z.string().optional().default(''),
    R2_ACCESS_KEY_ID: z.string().optional().default(''),
    R2_SECRET_ACCESS_KEY: z.string().optional().default(''),
    R2_BUCKET_NAME: z.string().optional().default(''),
    R2_PUBLIC_BASE_URL: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.STORAGE_PROVIDER !== 'r2') return;

    for (const key of R2_ENV_KEYS) {
      if (!data[key]?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${key} is required when STORAGE_PROVIDER=r2`,
          path: [key],
        });
      }
    }

    if (data.R2_PUBLIC_BASE_URL?.trim()) {
      try {
        // eslint-disable-next-line no-new
        new URL(data.R2_PUBLIC_BASE_URL);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'R2_PUBLIC_BASE_URL must be a valid URL',
          path: ['R2_PUBLIC_BASE_URL'],
        });
      }
    }
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
  r2: {
    accountId: raw.R2_ACCOUNT_ID,
    accessKeyId: raw.R2_ACCESS_KEY_ID,
    secretAccessKey: raw.R2_SECRET_ACCESS_KEY,
    bucketName: raw.R2_BUCKET_NAME,
    publicBaseUrl: raw.R2_PUBLIC_BASE_URL,
  },
  /** Email delivery is only fully configured when all three values are present. */
  get isEmailConfigured(): boolean {
    return Boolean(this.resendApiKey && this.contactEmail && this.emailFrom);
  },
};
