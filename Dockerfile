# syntax=docker/dockerfile:1.5
FROM node:22-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM deps AS builder
ENV NODE_ENV=production
ENV NODE_OPTIONS=--conditions=react-server
COPY . .
RUN corepack enable && pnpm exec contentlayer build && pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3210
ENV NODE_OPTIONS=--conditions=react-server
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./ .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/content ./content
RUN corepack enable

EXPOSE 3210
CMD ["pnpm", "start"]
