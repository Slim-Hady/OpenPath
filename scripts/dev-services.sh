#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE=(docker compose -f docker-compose.dev.yml)
PG_USER="${POSTGRES_USER:-osh}"
PG_DB="${POSTGRES_DB:-osh}"

usage() {
  cat <<'EOF'
Usage: ./scripts/dev-services.sh <command> [args]

  up            Start Postgres and Redis and wait until both are healthy
  down          Stop the containers, keep the data
  reset         Delete the containers, volumes and all local data
  status        Show container status
  logs [svc]    Follow logs (postgres or redis)
  psql [args]   Open psql on the dev database
  psql-test     Open psql on the test database
  redis [args]  Run redis-cli inside the Redis container
EOF
}

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is not installed. See dev/SETUP/00-prerequisites.md" >&2
    exit 1
  fi
  if docker info >/dev/null 2>&1; then
    return
  fi
  if command -v sg >/dev/null 2>&1 && sg docker -c 'docker info' >/dev/null 2>&1; then
    exec sg docker -c "cd '$ROOT_DIR' && ./scripts/dev-services.sh $*"
  fi
  echo "Docker is installed but the daemon is not reachable." >&2
  echo "Start Docker, or log out and back in after 'usermod -aG docker $USER'." >&2
  exit 1
}

require_docker "$@"

case "${1:-up}" in
  up)
    "${COMPOSE[@]}" up -d --wait
    echo
    echo "Postgres: postgresql://${PG_USER}:***@localhost:5432/${PG_DB}"
    echo "Redis:    redis://localhost:6379"
    ;;
  down)
    "${COMPOSE[@]}" down
    ;;
  reset)
    read -r -p "This deletes all local Postgres and Redis data. Continue? [y/N] " answer
    if [[ "${answer}" != "y" && "${answer}" != "Y" ]]; then
      echo "Cancelled."
      exit 1
    fi
    "${COMPOSE[@]}" down -v
    ;;
  status)
    "${COMPOSE[@]}" ps
    ;;
  logs)
    shift
    "${COMPOSE[@]}" logs -f "$@"
    ;;
  psql)
    shift
    "${COMPOSE[@]}" exec postgres psql -U "${PG_USER}" -d "${PG_DB}" "$@"
    ;;
  psql-test)
    shift
    "${COMPOSE[@]}" exec postgres psql -U "${PG_USER}" -d osh_test "$@"
    ;;
  redis)
    shift
    "${COMPOSE[@]}" exec redis redis-cli "$@"
    ;;
  -h|--help|help)
    usage
    ;;
  *)
    usage >&2
    exit 1
    ;;
esac
