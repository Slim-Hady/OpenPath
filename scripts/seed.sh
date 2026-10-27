#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
export PATH="$HOME/.local/bin:$PATH"

if [[ -f .env ]]; then
  echo "Applying migrations from .env…"
  pnpm db:deploy
else
  echo "Missing .env; seed needs the database and Supabase keys." >&2
  exit 1
fi
pnpm db:seed
echo
echo "Seeded accounts: dev@osh.dev · maintainer@osh.dev · admin@osh.dev · sam@osh.dev"
echo "Password: SEED_PASSWORD (default OpenSource!2026). Change it for anything shared."
