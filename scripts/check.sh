#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
export PATH="$HOME/.local/bin:$PATH"

echo "1/3 lint"
pnpm lint
echo "2/3 typecheck"
pnpm typecheck
echo "3/3 unit tests"
pnpm --filter @osh/contracts test
pnpm --filter @osh/api test -- --runInBand
pnpm --filter @osh/web test -- --maxWorkers=2
echo
echo "All checks passed. Integration tests are separate:"
echo "  pnpm --filter @osh/api test:integration -- --runInBand"
