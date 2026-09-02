# DevContainer Dockerfile for School Management
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    bash \
    curl \
    postgresql-client \
    redis

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /workspace

# Create node user with proper permissions
RUN addgroup -g 1000 node && adduser -u 1000 -G node -s /bin/sh -D node
RUN chown -R node:node /workspace

USER node

# Default command
CMD ["sleep", "infinity"]