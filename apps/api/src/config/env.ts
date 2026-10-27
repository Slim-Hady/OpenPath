import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { z } from 'zod';

const candidates = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '../../.env'),
  resolve(__dirname, '../../../../.env'),
  resolve(__dirname, '../../../.env'),
];

for (const candidate of candidates) {
  if (existsSync(candidate)) {
    config({ path: candidate, override: false });
    break;
  }
}

for (const key of Object.keys(process.env)) {
  if (process.env[key] === '') delete process.env[key];
}

const emptyToUndefined = (value: unknown) => (value === '' || value === null ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());
const bool = z.preprocess(
  emptyToUndefined,
  z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
);

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  API_URL: z.string().url().default('http://localhost:4000'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  LOG_LEVEL: z.string().default('info'),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
  DATABASE_URL: z.string().min(10),
  DIRECT_URL: z.string().min(10),
  SUPABASE_JWKS_URL: optionalUrl,
  STORAGE_BUCKET: z.string().default('cvs'),

  REDIS_URL: z.string().default('redis://localhost:6379'),
  WORKER_CONCURRENCY: z.coerce.number().int().min(1).max(20).default(2),

  GEMINI_API_KEY: optionalString,
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  AI_MAX_TOKENS_PER_USER: z.coerce.number().int().min(1000).default(20000),
  AI_TEMPERATURE: z.coerce.number().min(0).max(1).default(0.4),
  AI_USAGE_LIMIT_USD: z.coerce.number().min(0).default(5),

  // GitHub OAuth client id/secret live in Supabase, not in the API runtime.
  GITHUB_TOKEN_ENC_KEY: z.preprocess(emptyToUndefined, z.string().min(40).optional()),

  EMAIL_PROVIDER_API_KEY: optionalString,
  EMAIL_FROM: z.string().default('OpenSource-helper <onboarding@resend.dev>'),

  AUTH_DEV_MODE: bool,
  ENABLE_SCHEDULER: z.preprocess(
    emptyToUndefined,
    z
      .enum(['true', 'false'])
      .optional()
      .transform((value) => value !== 'false'),
  ),
  GITHUB_PUBLIC_FALLBACK: z.preprocess(
    emptyToUndefined,
    z
      .enum(['true', 'false'])
      .optional()
      .transform((value) => value !== 'false'),
  ),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | undefined;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const names = [...new Set(parsed.error.issues.map((issue) => issue.path.join('.')))];
    throw new Error(`Invalid environment. Check: ${names.join(', ')}. See .env.example.`);
  }
  cached = parsed.data;
  return cached;
}

export const isProduction = (): boolean => getEnv().NODE_ENV === 'production';
export const isTest = (): boolean => getEnv().NODE_ENV === 'test';
