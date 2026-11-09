FROM mcr.microsoft.com/devcontainers/javascript-node:22-bookworm

RUN apt-get update \
 && apt-get install -y --no-install-recommends postgresql-client redis-tools \
 && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /workspace
