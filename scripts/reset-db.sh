#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
read -r -p "This deletes the local dev Postgres and Redis data. Continue? [y/N] " answer
if [[ "$answer" != "y" && "$answer" != "Y" ]]; then
  echo "Cancelled."
  exit 1
fi
if docker info >/dev/null 2>&1; then
  docker compose -f docker-compose.dev.yml down -v
else
  sg docker -c "cd '$ROOT_DIR' && docker compose -f docker-compose.dev.yml down -v"
fi
echo "Local data deleted. Start again with ./scripts/dev-services.sh up"
