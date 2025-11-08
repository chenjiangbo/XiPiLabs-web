# Task Completion Checklist
1. Run `pnpm lint` after making code changes; fix any ESLint issues.
2. Run `pnpm build` before handing off substantial work (ensures Prisma client generation + Next build succeed). If only schema changes were made, run `pnpm prisma generate` first and commit resulting client changes.
3. When touching Prisma schema or migrations, run the appropriate `pnpm prisma migrate dev --name <change>` and document any required env vars (`DATABASE_URL`, etc.).
4. If MDX/content files changed, refresh the generated types via `pnpm exec contentlayer build` so build artifacts stay in sync.
5. Keep `.env.*` updates documented; never commit secrets.
6. Review `git status`/`git diff` to ensure only intended files are included, then commit with a descriptive message and mention any manual steps the reviewer should run (e.g., migrations, docker setup).