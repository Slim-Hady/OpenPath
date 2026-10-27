#!/usr/bin/env node
/**
 * Scans tracked files for credentials. Prints file and line only, never the
 * matched value. Run before every push and in CI.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';

const PATTERNS = [
  { name: 'JWT', regex: /eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}/ },
  { name: 'Google API key', regex: /AIza[0-9A-Za-z_-]{30,}/ },
  { name: 'GitHub token', regex: /gh[pousr]_[A-Za-z0-9]{30,}/ },
  { name: 'GitHub fine-grained token', regex: /github_pat_[A-Za-z0-9_]{20,}/ },
  { name: 'Resend key', regex: /re_[A-Za-z0-9]{20,}/ },
  { name: 'Supabase secret key', regex: /sb_secret_[A-Za-z0-9_-]{10,}/ },
  { name: 'Private key', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  {
    name: 'Connection string with credentials',
    regex: /postgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@/,
  },
  {
    name: 'service_role secret',
    regex: /service_role[^\n]{0,80}(?:eyJ[A-Za-z0-9_-]{10,}|[A-Za-z0-9_-]{40,})/i,
  },
];

const SKIP = [/^pnpm-lock\.yaml$/, /^\.env/, /^dev\//, /\.(png|jpg|jpeg|gif|webp|ico|pdf)$/i];

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
  .filter((file) => !SKIP.some((pattern) => pattern.test(file)));

let hits = 0;
for (const file of files) {
  let info;
  try {
    info = statSync(file);
  } catch {
    continue;
  }
  if (!info.isFile() || info.size > 1_500_000) continue;
  const content = readFileSync(file, 'utf8');
  if (content.includes('\0')) continue;
  const lines = content.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    // Local development defaults, placeholders and masked URLs are not secrets.
    if (
      line.includes('osh_dev_password') ||
      line.includes('<password>') ||
      line.includes(':***@') ||
      line.includes('${POSTGRES_PASSWORD')
    ) {
      continue;
    }
    for (const pattern of PATTERNS) {
      if (pattern.regex.test(line)) {
        hits += 1;
        console.log(`${file}:${index + 1}  ${pattern.name}`);
      }
    }
  }
}

if (hits > 0) {
  console.log(`\n${hits} possible secret(s) found in tracked files. Remove them before pushing.`);
  process.exitCode = 1;
} else {
  console.log(`No secrets found in ${files.length} tracked files.`);
}
