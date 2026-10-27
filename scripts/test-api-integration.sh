#!/usr/bin/env bash
# Applies the migration to the test database, then runs the integration suite.
# Accepts (and ignores) extra pnpm arguments such as `-- --runInBand`.
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/apps/api"
TEST_URL="${TEST_DATABASE_URL:-postgresql://osh:osh_dev_password@localhost:5432/osh_test}"
export DATABASE_URL="$TEST_URL"
export DIRECT_URL="$TEST_URL"
./node_modules/.bin/prisma migrate deploy >/dev/null
exec ./node_modules/.bin/jest --runInBand --testMatch '**/*.integration.ts'
