FROM node:20-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json tsconfig.json ./
COPY apps/websocket/package.json apps/websocket/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/validation/package.json packages/validation/package.json
RUN pnpm install --no-frozen-lockfile

FROM base AS build
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @puqme/config build
RUN pnpm --filter @puqme/types build
RUN pnpm --filter @puqme/validation build
RUN pnpm --filter @puqme/websocket build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY --from=build /app ./
EXPOSE 3010
CMD ["pnpm", "--filter", "@puqme/websocket", "start"]
