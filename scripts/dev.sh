#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
export PATH="$HOME/.local/bin:$PATH"
if [[ ! -f .env ]]; then
  echo "Missing .env. Copy .env.example and fill it locally." >&2
  exit 1
fi
if ! pgrep -f 'docker compose.*postgres' >/dev/null 2>&1; then
  ./scripts/dev-services.sh up || true
fi
pnpm dev
