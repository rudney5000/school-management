FROM node:22-alpine AS base
RUN npm install -g pnpm

# ── Dépendances de prod (structure complète du workspace) ──
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/
COPY packages/pdf-templates/package.json ./packages/pdf-templates/
RUN pnpm install --frozen-lockfile --prod --filter @school/backend... --ignore-scripts

# ── Build (deps complètes incl. dev, puis compile pdf-templates → backend) ──
FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/
COPY packages/pdf-templates/package.json ./packages/pdf-templates/
RUN pnpm install --frozen-lockfile --filter @school/backend... --ignore-scripts
COPY packages/pdf-templates/ ./packages/pdf-templates/
COPY backend/ ./backend/
RUN pnpm --filter @school-hub/pdf-templates build
RUN pnpm --filter @school/backend build

# ── Production ────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps    /app/node_modules                      ./node_modules
COPY --from=deps    /app/backend/node_modules               ./backend/node_modules
COPY --from=builder /app/packages/pdf-templates/dist        ./packages/pdf-templates/dist
COPY --from=builder /app/packages/pdf-templates/package.json ./packages/pdf-templates/package.json
COPY --from=builder /app/backend/dist                        ./dist
COPY --from=builder /app/backend/src/db/migrations           ./migrations
COPY --from=builder /app/backend/package.json                ./package.json
RUN npm install dotenv

EXPOSE 3000

CMD ["node", "dist/index.js"]