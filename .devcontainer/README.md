# DevContainer Setup

This project uses VS Code Dev Containers for a consistent development environment.

## Quick Start

1. **Prerequisites:**
   - Docker Desktop installed and running
   - VS Code with "Dev Containers" extension (`ms-vscode-remote.remote-containers`)

2. **Open in DevContainer:**
   - Open project in VS Code
   - Press `F1` → "Dev Containers: Reopen in Container"
   - Wait for build (first time takes ~2-3 minutes)

3. **Inside the container:**

   ```bash
   # Install dependencies (auto-runs on create)
   pnpm install

   # Start databases (already running via docker-compose)
   # Start backend
   pnpm --filter backend dev

   # Start frontend (in another terminal)
   pnpm --filter frontend dev
   ```

## Ports Forwarded

| Port      | Service         |
| --------- | --------------- |
| 3000      | Backend API     |
| 5173      | Frontend (Vite) |
| 5432      | PostgreSQL      |
| 6379      | Redis           |
| 9000/9001 | MinIO           |
| 7880/7881 | LiveKit         |

## Services

- **postgres**: PostgreSQL 16 (DB: `school_dev`, user: `school`, pass: `schoolpass`)
- **redis**: Redis 7 with persistence
- **minio**: S3-compatible storage
- **livekit**: WebRTC server for video calls
- **app**: Development container with Node 20, pnpm, build tools

## Useful Commands

```bash
# Database migrations
pnpm --filter backend db:push
pnpm --filter backend db:studio

# Run tests
pnpm test

# Lint & typecheck
pnpm lint
pnpm typecheck
```

## Troubleshooting

- **Port conflicts**: Change ports in `docker-compose.dev.yml`
- **Permission issues**: Run `sudo chown -R $USER:$USER .` on host
- **Rebuild container**: `F1` → "Dev Containers: Rebuild Container"
