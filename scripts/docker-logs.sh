#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
if docker info >/dev/null 2>&1; then
  docker compose logs -f "$@"
else
  sg docker -c "cd '$ROOT_DIR' && docker compose logs -f $*"
fi
