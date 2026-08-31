# K-Dream

pnpm + Turborepo 모노레포.

- `apps/server` — NestJS 11 + Prisma 7, port 17000
- `apps/admin` — Next.js 16 관리자 콘솔, port 17001
- `apps/portal` — Next.js 16 공개 사이트 (static export → Firebase Hosting), port 17002

루트에서 `pnpm dev` 하면 세 앱이 동시에 뜬다. 개별 실행은 `pnpm dev:server` / `dev:admin` / `dev:portal`.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
