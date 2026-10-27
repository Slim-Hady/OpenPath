#!/usr/bin/env node
/**
 * Creates the private CV bucket with the service role key.
 * Idempotent. Never prints the key.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const envPath = resolve(root, '.env');
if (!existsSync(envPath)) {
  console.error('Missing .env. Copy .env.example first.');
  process.exit(1);
}
const env = {};
for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  if (!line || line.trim().startsWith('#')) continue;
  const index = line.indexOf('=');
  if (index < 0) continue;
  env[line.slice(0, index).trim()] = line.slice(index + 1).trim();
}
const url = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = env.STORAGE_BUCKET ?? 'cvs';
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
const existing = await fetch(`${url}/storage/v1/bucket/${encodeURIComponent(bucket)}`, { headers });
if (existing.ok) {
  console.log(`PASS bucket "${bucket}" already exists`);
  process.exit(0);
}
const created = await fetch(`${url}/storage/v1/bucket`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    id: bucket,
    name: bucket,
    public: false,
    file_size_limit: 5_242_880,
    allowed_mime_types: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  }),
});
if (!created.ok) {
  console.error(`FAIL bucket creation returned ${created.status}`);
  process.exit(1);
}
console.log(`PASS bucket "${bucket}" created (private, 5 MB limit)`);
