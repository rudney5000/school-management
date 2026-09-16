#!/usr/bin/env bash
#
# Brings the local development environment up, from nothing to ready to code.
# Safe to re-run: every step checks its own state first.
#
#   pnpm dev:up      start everything
#   pnpm dev:down    stop the containers (data is kept)
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

REQUIRED_NODE_MAJOR=22
REQUIRED_NODE_MINOR=13
TEST_DB=school_hub_test

step() { printf '\n\033[1;34m▸ %s\033[0m\n' "$1"; }
ok() { printf '  \033[32m✓\033[0m %s\n' "$1"; }
die() {
  printf '\n\033[1;31m✗ %s\033[0m\n' "$1" >&2
  [ $# -gt 1 ] && printf '  %s\n' "$2" >&2
  exit 1
}

# ── Stop ────────────────────────────────────────────────────────────────────
if [ "${1:-up}" = "down" ]; then
  step "Stopping containers"
  docker compose down
  ok "Stopped. Volumes kept — 'docker compose down -v' also wipes the data."
  exit 0
fi

# ── Prerequisites ───────────────────────────────────────────────────────────
step "Checking prerequisites"

command -v node >/dev/null || die "node is not installed" "This project needs Node >= ${REQUIRED_NODE_MAJOR}.${REQUIRED_NODE_MINOR}."

node_version=$(node -v | sed 's/^v//')
node_major=${node_version%%.*}
node_minor=$(printf '%s' "$node_version" | cut -d. -f2)

if [ "$node_major" -lt "$REQUIRED_NODE_MAJOR" ] ||
  { [ "$node_major" -eq "$REQUIRED_NODE_MAJOR" ] && [ "$node_minor" -lt "$REQUIRED_NODE_MINOR" ]; }; then
  die "Node ${node_version} is too old (need >= ${REQUIRED_NODE_MAJOR}.${REQUIRED_NODE_MINOR})" \
    "With nvm: nvm install ${REQUIRED_NODE_MAJOR} && nvm use ${REQUIRED_NODE_MAJOR}"
fi
ok "Node ${node_version}"

command -v pnpm >/dev/null || die "pnpm is not installed" "corepack enable && corepack prepare pnpm@latest --activate"
ok "pnpm $(pnpm -v)"

command -v docker >/dev/null || die "docker is not installed"
docker compose version >/dev/null 2>&1 || die "docker compose v2 is not available" "Install the Compose plugin, or upgrade Docker."
docker info >/dev/null 2>&1 || die "the Docker daemon is not reachable" "Start Docker, then run this again."
ok "Docker ready"

# ── Environment file ────────────────────────────────────────────────────────
step "Environment file"

if [ -f .env ]; then
  ok ".env already present — left untouched"
else
  cp .env.example .env
  ok ".env created from .env.example"
fi

# The backend reads backend/.env when running in watch mode.
if [ ! -f backend/.env ]; then
  ln -s ../.env backend/.env
  ok "backend/.env linked to the root .env"
fi

# ── Containers ──────────────────────────────────────────────────────────────
step "Starting containers"
docker compose up -d
ok "postgres · redis · minio · livekit"

printf '  waiting for postgres'
for _ in $(seq 1 60); do
  if docker compose exec -T postgres pg_isready -U school -d school_dev >/dev/null 2>&1; then
    printf '\n'
    ok "postgres accepting connections"
    break
  fi
  printf '.'
  sleep 1
done

docker compose exec -T postgres pg_isready -U school -d school_dev >/dev/null 2>&1 ||
  die "postgres did not become ready in 60s" "Check: docker compose logs postgres"

# ── Test database ───────────────────────────────────────────────────────────
# Mirrors the CI credentials so the test suite needs no local configuration.
step "Test database"

psql_root() { docker compose exec -T postgres psql -U school -d school_dev -v ON_ERROR_STOP=1 "$@"; }

if [ -z "$(psql_root -tAc "SELECT 1 FROM pg_roles WHERE rolname = 'test'")" ]; then
  psql_root -c "CREATE ROLE test LOGIN PASSWORD 'test' SUPERUSER" >/dev/null
  ok "role 'test' created"
else
  ok "role 'test' already there"
fi

if [ -z "$(psql_root -tAc "SELECT 1 FROM pg_database WHERE datname = '${TEST_DB}'")" ]; then
  psql_root -c "CREATE DATABASE ${TEST_DB} OWNER test" >/dev/null
  ok "database '${TEST_DB}' created"
else
  ok "database '${TEST_DB}' already there"
fi

# ── Workspace ───────────────────────────────────────────────────────────────
step "Installing dependencies"
# CI=true skips pnpm's interactive confirmation before pruning node_modules,
# which has no TTY to answer it when this script isn't run from a terminal.
CI=true pnpm install
ok "workspace installed"

# The backend imports this package; without its dist the app will not even boot.
step "Building shared packages"
pnpm --filter @school-hub/pdf-templates build
ok "@school-hub/pdf-templates built"

step "Applying migrations to the development database"
pnpm --filter backend db:migrate
ok "development schema up to date"

# ── Done ────────────────────────────────────────────────────────────────────
cat <<'EOF'

Ready.

  pnpm dev            backend + frontend
  pnpm --filter backend test     test suite (uses the test database above)
  pnpm --filter backend db:seed  load demo data
  pnpm dev:down       stop the containers

  postgres  localhost:5432   school / schoolpass / school_dev
  minio     localhost:9001   console
  livekit   localhost:7880
EOF
