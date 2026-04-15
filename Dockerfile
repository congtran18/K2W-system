# Use official Node.js Alpine base image
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@8.15.0

# Copy workspace setup files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy configurations and manifests of all workspace packages
COPY packages/database/package.json ./packages/database/
COPY packages/ai/package.json ./packages/ai/
COPY packages/utils/package.json ./packages/utils/
COPY apps/api/package.json ./apps/api/

# Install dependencies (only packages needed for backend)
RUN pnpm install --frozen-lockfile

# Copy the rest of the workspace source code
COPY packages/database ./packages/database
COPY packages/ai ./packages/ai
COPY packages/utils ./packages/utils
COPY apps/api ./apps/api

# Build all local packages in the correct dependency order, then build the API
RUN pnpm --filter @k2w/database build && \
    pnpm --filter @k2w/ai build && \
    pnpm --filter @k2w/utils build && \
    pnpm --filter @k2w/api build

# --- Runtime Stage ---
FROM node:18-alpine

WORKDIR /app

RUN npm install -g pnpm@8.15.0

# Copy manifests and lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/database/package.json ./packages/database/
COPY packages/ai/package.json ./packages/ai/
COPY packages/utils/package.json ./packages/utils/
COPY apps/api/package.json ./apps/api/

# Install production-only dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built artifacts from builder stage
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/migrations ./packages/database/migrations
COPY --from=builder /app/packages/ai/dist ./packages/ai/dist
COPY --from=builder /app/packages/utils/dist ./packages/utils/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Expose Hugging Face default port (7860) or any port passed
ENV PORT=7860
EXPOSE 7860

# Run the API backend using pnpm script
CMD ["pnpm", "--filter", "@k2w/api", "start"]
