#!/usr/bin/env node
/**
 * Verifies the local environment without printing a single secret value.
 * Exit code 0 means every integration answered; 1 means at least one failed.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';
import Redis from 'ioredis';

const root = resolve(import.meta.dirname, '..');
const envPath = resolve(root, '.env');
if (!existsSync(envPath)) {
  console.log('FAIL env — .env does not exist. Copy .env.example to .env first.');
  process.exit(1);
}

const env = {};
for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  if (!line || line.trim().startsWith('#')) continue;
  const index = line.indexOf('=');
  if (index < 0) continue;
  const key = line.slice(0, index).trim();
  const value = line.slice(index + 1).trim().replace(/^"|"$/g, '');
  env[key] = value;
}

const required = [
  'NODE_ENV',
  'PORT',
  'API_URL',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'DIRECT_URL',
  'STORAGE_BUCKET',
  'REDIS_URL',
  'GEMINI_API_KEY',
  'GEMINI_MODEL',
  'AI_MAX_TOKENS_PER_USER',
  'AI_TEMPERATURE',
  'AI_USAGE_LIMIT_USD',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GITHUB_TOKEN_ENC_KEY',
  'EMAIL_PROVIDER_API_KEY',
  'EMAIL_FROM',
];

let failed = 0;
async function check(name, fn) {
  try {
    const detail = await fn();
    console.log(`PASS ${name}${detail ? ` — ${detail}` : ''}`);
  } catch (error) {
    failed += 1;
    const reason =
      error instanceof Error && error.message && !error.message.includes('://')
        ? error.message
        : 'check failed';
    console.log(`FAIL ${name} — ${reason.slice(0, 180)}`);
  }
}

await check('required keys', () => {
  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) throw new Error(`missing: ${missing.join(', ')}`);
  const placeholders = required.filter((key) =>
    /changeme|placeholder|<[^>]+>|your[-_]?(key|token|secret)/i.test(env[key]),
  );
  if (placeholders.length > 0) throw new Error(`placeholder values: ${placeholders.join(', ')}`);
  if (env.NODE_ENV === 'production' && env.AUTH_DEV_MODE === 'true') {
    throw new Error('AUTH_DEV_MODE must be false in production');
  }
  return `${required.length} keys present`;
});

await check('encryption key', () => {
  const decoded = Buffer.from(env.GITHUB_TOKEN_ENC_KEY, 'base64');
  if (decoded.length !== 32) throw new Error('GITHUB_TOKEN_ENC_KEY must decode to exactly 32 bytes');
  return '32 bytes';
});

const supabaseBase = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
await check('supabase auth health', async () => {
  const response = await fetch(`${supabaseBase}/auth/v1/health`, {
    headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`health returned ${response.status}`);
  return 'HTTP 200';
});

await check('supabase storage bucket', async () => {
  const response = await fetch(
    `${supabaseBase}/storage/v1/bucket/${encodeURIComponent(env.STORAGE_BUCKET)}`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (response.status === 404) throw new Error(`bucket "${env.STORAGE_BUCKET}" is missing`);
  if (!response.ok) throw new Error(`storage returned ${response.status}`);
  return `bucket "${env.STORAGE_BUCKET}" exists`;
});

async function database(connectionString) {
  const client = new pg.Client({
    connectionString,
    connectionTimeoutMillis: 10_000,
    ssl: /supabase\.(co|com)/.test(connectionString) ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();
  try {
    await client.query('SELECT 1');
  } finally {
    await client.end();
  }
}

await check('database (DATABASE_URL)', async () => {
  await database(env.DATABASE_URL);
  return 'SELECT 1';
});

await check('database (DIRECT_URL)', async () => {
  await database(env.DIRECT_URL);
  return 'SELECT 1';
});

await check('redis', async () => {
  const redis = new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => (times > 2 ? null : 200),
  });
  try {
    await redis.connect();
    const pong = await redis.ping();
    if (pong !== 'PONG') throw new Error('PING did not return PONG');
    return 'PONG';
  } finally {
    redis.disconnect();
  }
});

await check('gemini key', async () => {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
    headers: { 'x-goog-api-key': env.GEMINI_API_KEY },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`models returned ${response.status}`);
  const payload = await response.json();
  const names = (payload.models ?? []).map((model) => String(model.name).replace('models/', ''));
  if (!names.includes(env.GEMINI_MODEL)) {
    throw new Error(`GEMINI_MODEL is not in the model list (${names.length} models available)`);
  }
  return `model "${env.GEMINI_MODEL}" available`;
});

await check('resend key', async () => {
  const response = await fetch('https://api.resend.com/domains', {
    headers: { Authorization: `Bearer ${env.EMAIL_PROVIDER_API_KEY}` },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`domains returned ${response.status}`);
  return 'HTTP 200';
});

console.log('');
if (failed > 0) {
  console.log(`${failed} check(s) failed. Fix .env locally; never paste values into chat.`);
  process.exitCode = 1;
} else {
  console.log('All environment checks passed.');
}
