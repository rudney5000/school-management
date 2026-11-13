FROM mcr.microsoft.com/devcontainers/javascript-node:22-bookworm

RUN apt-get update \
 && apt-get install -y --no-install-recommends postgresql-client redis-tools \
 && rm -rf /var/lib/apt/lists/*

# The base image ships a global pnpm that shadows corepack and cannot switch
# to the version pinned in package.json, so remove it and let corepack serve pnpm.
RUN npm uninstall -g pnpm || true \
 && corepack enable

WORKDIR /workspace
