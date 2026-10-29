# Developer Profile — PM1 per-service container.
# Build context is the repository root:
#   docker build -f services/developer-profile/Dockerfile -t osh/developer-profile:pm1 .

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/service-kit/package.json packages/service-kit/
COPY services/developer-profile/package.json services/developer-profile/
RUN pnpm install --frozen-lockfile --ignore-scripts \
      --filter @osh/service-developer-profile... --filter @osh/service-kit...

FROM deps AS build
COPY packages/service-kit packages/service-kit
COPY services/developer-profile services/developer-profile
RUN pnpm --filter @osh/service-kit build \
 && pnpm --filter @osh/service-developer-profile build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production PORT=3000 SERVICE_NAME=developer-profile
WORKDIR /app
RUN addgroup -S osh && adduser -S osh -G osh
COPY --from=build --chown=osh:osh /app/node_modules ./node_modules
COPY --from=build --chown=osh:osh /app/packages/service-kit ./packages/service-kit
COPY --from=build --chown=osh:osh /app/services/developer-profile ./services/developer-profile
USER osh
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health" >/dev/null || exit 1
CMD ["node", "services/developer-profile/dist/main.js"]
