#!/usr/bin/env bash
# Accepts (and ignores) extra pnpm arguments such as `-- --runInBand`.
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/apps/api"
exec ./node_modules/.bin/jest --runInBand --testMatch '**/*.integration.ts'
