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

## 계정 · 권한

관리자와 에이전트를 나누지 않고 `staff` 한 테이블에 `type`(`ADMIN` / `AGENT`)으로
구분한다. 비밀번호는 bcrypt 해시로만 저장한다.

| 구분 | 접근 범위 |
| --- | --- |
| `ADMIN` | 관리자·에이전트·학교 관리, **모든 에이전트가 등록한 학생** 검토, 감사로그 |
| `AGENT` | **본인이 등록한 학생만** 조회. 검토 상태는 바꿀 수 없다 |

관리자 콘솔은 두 역할이 같이 쓴다. 사이드바 메뉴와 대시보드 지표가 역할에 따라
달라지고, 에이전트가 관리자 전용 경로로 들어오면
[proxy.ts](apps/admin/src/proxy.ts)가 `/students` 로 돌려보낸다.
화면 분기는 편의일 뿐이고, 실제 권한은 API 서버의 `AdminGuard` 와
학생 조회 `where` 절이 강제한다.

관리자 계정은 콘솔의 **관리자 → 계정 생성**, 에이전트 계정은 **에이전트 → 계정 생성**
에서 만든다. 최초 관리자 계정은 시드 스크립트가 만든다 (`ADMIN_LOGIN_ID` / `ADMIN_PASSWORD`,
기본값 `admin` / `admin123!@#`).

콘솔에서 잠기는 것을 막기 위해 **본인 계정 정지**와 **마지막 활성 관리자 정지**는
서버에서 거부한다.

### 세션

로그인 성공 시 서버가 `admin_token` httpOnly JWT 쿠키를 내려주고,
관리자 앱의 [proxy.ts](apps/admin/src/proxy.ts)가 그 쿠키로 `/login` 외
모든 경로를 보호한다.

**로그아웃하면 쿠키와 함께 브라우저에 저장해 둔 계정 정보(`계정 정보 저장`)도
같이 지운다** — 로그아웃 후 로그인 화면은 항상 빈 폼이다. 반면 세션만 만료된
경우에는 저장된 계정을 남겨두고 로그인 화면으로만 보낸다 (다시 로그인하라고
저장한 값이므로).

## 데이터 모델

| 테이블 | 역할 |
| --- | --- |
| `staff` | 관리자·에이전트 통합 계정 (권한) |
| `schools` | 학생이 신청할 학교. 관리자가 CRUD |
| `students` | 에이전트가 등록. 학생번호는 `UZ-2026-0001` 형식으로 서버가 발급 |
| `documents` | 여권·성적·TOPIK 등. 메타데이터만 DB, 파일은 비공개 저장소 |
| `audit_logs` | 관리자 콘솔에서 실행한 액션 기록 |

### 학생 등록 · 검토 흐름

```
에이전트 등록 → 검토요청 → 검토중 → 서류보완필요 ⇄ 검토중 → 검토완료
```

학생은 콘솔의 **학생 → 학생 등록**에서 만든다. 에이전트는 본인 앞으로만 등록되고,
관리자는 담당 에이전트를 골라서 등록한다. 학생번호(`UZ-2026-0001`)와 국가는
**담당 에이전트 기준으로 서버가 정한다** — 화면 입력값으로 바꿀 수 없다.

`검토요청`은 에이전트가 등록할 때만 붙고, 나머지 전환은 **관리자만** 할 수 있다.
`서류보완필요`로 바꿀 때는 사유가 필수이며 에이전트에게 그대로 노출된다.
검토완료 전까지는 에이전트가 **정보 수정**으로 보완할 수 있고, 검토완료 후에는 잠긴다.

## DB 셋업

```bash
cd apps/server
cp .env.example .env      # DATABASE_URL 을 Supabase 연결 문자열로 교체
pnpm prisma migrate deploy
pnpm prisma:seed          # 초기 관리자 계정 생성
```

### Supabase 연결 방식

Render 같은 상시 컨테이너에서는 **Session pooler(5432)** 를 쓴다.

| 방식 | 쓸 수 있나 |
| --- | --- |
| Direct connection | ✗ IPv6 전용이라 Render 에서 연결되지 않는다 |
| Transaction pooler (6543) | ✗ 세션 상태가 유지되지 않아 `prisma migrate deploy` 가 깨진다 |
| **Session pooler (5432)** | ✓ IPv4 로 붙고 마이그레이션·prepared statement 가 정상 동작 |

```
postgresql://postgres.<project-ref>:<비밀번호>@aws-0-<region>.pooler.supabase.com:5432/postgres
```

`?pgbouncer=true` 는 **트랜잭션 풀러 전용**이므로 session pooler 에는 붙이지 않는다.
`SHADOW_DATABASE_URL` 은 로컬 `migrate dev` 에서만 쓰이므로 배포 환경에는 필요 없다.

로컬 개발은 `pnpm db:reset` 으로 초기화 + 시드를 한 번에 할 수 있다.
`.env` 에서 `#` 가 들어가는 값은 반드시 따옴표로 감쌀 것 — dotenv 가 주석으로
잘라낸다.

## 환경 변수

각 앱의 `.env.example`을 `.env`(서버) / `.env.local`(프론트)로 복사해서 사용.

- `apps/server/.env` — `PORT`, `DATABASE_URL`, 스토리지 설정
- `apps/admin/.env.local` — `NEXT_PUBLIC_API_URL`

## 포털 다국어

한국어·영어·우즈베크어·몽골어·베트남어 5개 언어를 지원한다. 언어는 **쿼리파람**으로
정해지므로 QR 코드는 아래 주소를 그대로 넣으면 된다.

| 언어 | 주소 |
| --- | --- |
| 한국어 (기본) | `https://<도메인>/` |
| 영어 | `https://<도메인>/?lang=en` |
| 우즈베크어 | `https://<도메인>/?lang=uz` |
| 몽골어 | `https://<도메인>/?lang=mn` |
| 베트남어 | `https://<도메인>/?lang=vi` |

지원하지 않는 값(`?lang=xx`)은 한국어로 떨어진다. 헤더에서 언어를 바꾸면 주소도
같이 바뀌므로 그 상태로 링크를 공유해도 같은 언어로 열린다.

문구는 [translations.ts](apps/portal/src/lib/translations.ts) 한 파일에 모여 있다.

## 배포

포털은 Firebase Hosting에 정적 배포된다. 루트의 `firebase.json`이
`apps/portal/out`을 바라본다.

```bash
pnpm deploy   # portal 빌드 + firebase hosting 배포
```
