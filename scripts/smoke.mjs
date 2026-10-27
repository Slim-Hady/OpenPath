#!/usr/bin/env node
/** End-to-end smoke without printing tokens. Requires the stack on :3000 and :4000. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const env = {};
for (const line of readFileSync(resolve(root, '.env'), 'utf8').split(/\r?\n/)) {
  if (!line || line.trim().startsWith('#')) continue;
  const index = line.indexOf('=');
  if (index < 0) continue;
  env[line.slice(0, index).trim()] = line.slice(index + 1).trim();
}
const password = env.SEED_PASSWORD || 'OpenSource!2026';
const api = 'http://localhost:4000';
const web = 'http://localhost:3000';
let failed = 0;
async function check(name, fn) {
  try {
    const detail = await fn();
    console.log(`PASS ${name}${detail ? ` — ${detail}` : ''}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL ${name} — ${error instanceof Error ? error.message.slice(0, 140) : 'failed'}`);
  }
}
async function login(email) {
  const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`login ${response.status}`);
  return payload.access_token;
}
await check('web home', async () => {
  const response = await fetch(web);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return `HTTP ${response.status}`;
});
await check('api health', async () => {
  const response = await fetch(`${api}/health`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return 'ok';
});
await check('api ready (DB + Redis)', async () => {
  const response = await fetch(`${api}/health/ready`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return 'ready';
});
await check('public learning', async () => {
  const response = await fetch(`${api}/learning?q=git`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data.items) || data.items.length === 0) throw new Error('no resources');
  return `${data.items.length} resources`;
});
let devToken;
await check('developer login', async () => {
  devToken = await login('dev@osh.dev');
  return 'session issued';
});
await check('profile gate', async () => {
  const response = await fetch(`${api}/profile`, { headers: { Authorization: `Bearer ${devToken}` } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!data.complete) throw new Error('seeded profile is incomplete');
  return `level ${data.experienceLevel}, ${data.languages.length} languages`;
});
await check('progress dashboard', async () => {
  const response = await fetch(`${api}/progress`, { headers: { Authorization: `Bearer ${devToken}` } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return 'readable';
});
await check('admin role gate', async () => {
  const adminToken = await login('admin@osh.dev');
  const forbidden = await fetch(`${api}/admin/metrics`, { headers: { Authorization: `Bearer ${devToken}` } });
  if (forbidden.status !== 403) throw new Error(`developer got ${forbidden.status}`);
  const allowed = await fetch(`${api}/admin/metrics`, { headers: { Authorization: `Bearer ${adminToken}` } });
  if (!allowed.ok) throw new Error(`admin got ${allowed.status}`);
  return '403 for developer, 200 for admin';
});
console.log('');
if (failed > 0) {
  console.log(`${failed} smoke check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('Smoke passed.');
}
