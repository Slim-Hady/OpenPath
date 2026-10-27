#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  echo "Missing .env. Copy .env.example and fill it locally." >&2
  exit 1
fi

DOCKER=(docker compose)
if ! docker info >/dev/null 2>&1; then
  if command -v sg >/dev/null 2>&1 && sg docker -c 'docker info' >/dev/null 2>&1; then
    echo "Docker needs the docker group; using sg docker for this run."
    exec sg docker -c "cd '$ROOT_DIR' && docker compose up --build $*"
  fi
  echo "Docker is not reachable. Start it or re-login after joining the docker group." >&2
  exit 1
fi

"${DOCKER[@]}" up --build "$@"
echo
echo "web   http://localhost:3000"
echo "api   http://localhost:4000/health"
echo "worker: docker compose logs -f worker"
