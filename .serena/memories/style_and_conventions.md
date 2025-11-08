# Style & Conventions
- TypeScript-first Next.js App Router codebase; prefer `async`/`await`, typed payloads, and explicit error responses via `NextResponse`.
- API handlers live in `src/app/api/**/route.ts` and typically read cookies via `NextRequest`, verify JWTs (`sub` claims), and hit Prisma models that mirror `prisma/schema.prisma`.
- Prisma access is centralized through `src/lib/prisma.ts`; IDs are UUID strings and timestamps use Postgres `timestamptz`.
- Styling mixes Tailwind CSS v4 utilities (via the new global import) with custom CSS classes inside `globals.css`; components expect semantic class names like `showcase__card`.
- Content blocks are MDX files compiled by Contentlayer; components should stay compatible with server rendering (avoid browser-only APIs unless gated).
- Follow ESLint `next/core-web-vitals` + `next/typescript` rules; remove unused imports, respect React Hook rules, and keep files ASCII-only unless existing content dictates otherwise.