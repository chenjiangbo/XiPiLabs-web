# Suggested Commands
- Install deps: `pnpm install` (pnpm is preferred; npm/yarn/bun scripts exist but pnpm keeps lockfile in sync).
- Dev server: `pnpm dev` (Next dev server on port 3000; honors App Router + Contentlayer hot reload).
- Type check & build: `pnpm build` (runs `prisma generate` automatically, then `next build --webpack`). Start prod bundle with `pnpm start`.
- Lint: `pnpm lint` (ESLint with Next core-web-vitals rules).
- Prisma: `pnpm prisma generate`, `pnpm prisma migrate dev --name <change>`, `pnpm prisma studio`.
- Contentlayer: `pnpm exec contentlayer build` (needed before Container builds or to refresh MDX types).
- Docker: `docker compose up --build` (or `docker compose -f docker-compose.local.yml up` for the local file) and `docker compose down` to stop.
- Useful macOS shell helpers: `ls`, `pwd`, `rg <pattern> -n`, `find . -name`, `git status`, `git diff`. `open <path>` works on Darwin if you need to preview files.