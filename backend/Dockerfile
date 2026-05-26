FROM node:22-alpine AS base
RUN npm install -g pnpm

# ── Dépendances ───────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/
RUN pnpm install --frozen-lockfile --prod --filter @school/backend --ignore-scripts

# ── Build ─────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/
RUN pnpm install --frozen-lockfile --filter @school/backend --ignore-scripts
COPY backend/ ./backend/
RUN pnpm --filter @school/backend build

# ── Production ────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps    /app/node_modules         ./node_modules
COPY --from=deps    /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/dist         ./dist
COPY --from=builder /app/backend/src/db/migrations ./migrations
COPY --from=builder /app/backend/package.json ./package.json
RUN npm install dotenv

EXPOSE 3000

CMD ["node", "dist/index.js"]