# syntax=docker/dockerfile:1.5
FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
RUN corepack enable && pnpm exec contentlayer build && pnpm build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./ .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/content ./content

EXPOSE 3000
CMD ["pnpm", "start"]
