# K-Dream

외국인 유학생 입학~정주 원스톱 플랫폼. pnpm + Turborepo 모노레포.

## 구조

| 앱 | 경로 | 포트 | 스택 |
| --- | --- | --- | --- |
| 서버 | `apps/server` | 17000 | NestJS 11 + Prisma 7 (PostgreSQL) |
| 관리자 | `apps/admin` | 17001 | Next.js 16 + Tailwind v4 |
| 포털 | `apps/portal` | 17002 | Next.js 16 + Tailwind v4 (static export) |

## 실행

```bash
pnpm install
pnpm dev          # 서버 + 관리자 + 포털 동시 실행
pnpm dev:server   # 서버만
pnpm dev:admin    # 관리자만
pnpm dev:portal   # 포털만
pnpm build        # 전체 빌드
pnpm lint         # 전체 린트
```

## 환경 변수

각 앱의 `.env.example`을 `.env`(서버) / `.env.local`(프론트)로 복사해서 사용.

- `apps/server/.env` — `PORT`, `DATABASE_URL`
- `apps/admin/.env.local` — `NEXT_PUBLIC_API_URL`

## 배포

포털은 Firebase Hosting에 정적 배포된다. 루트의 `firebase.json`이
`apps/portal/out`을 바라본다.

```bash
pnpm deploy   # portal 빌드 + firebase hosting 배포
```
