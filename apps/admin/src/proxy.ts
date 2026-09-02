import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** 서버(NestJS)가 내려주는 httpOnly 쿠키 이름과 동일해야 한다. */
const AUTH_COOKIE = "admin_token";

/** 관리자(ADMIN)만 쓸 수 있는 경로. 에이전트는 학생 화면으로 보낸다. */
const ADMIN_ONLY = ["/admins", "/agents", "/schools", "/audit-logs"];

export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/login";

  if (!token) {
    return isLoginPage
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", request.url));
  }
  if (isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 서명 검증은 API 서버가 하고, 여기서는 화면 분기용으로만 payload 를 읽는다.
  // (Next 문서가 말하는 optimistic check — 권한의 최종 판단 근거가 아니다)
  const staffType = readStaffType(token);
  if (staffType === "AGENT" && ADMIN_ONLY.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/students", request.url));
  }

  return NextResponse.next();
}

function readStaffType(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return (JSON.parse(json) as { type?: string }).type ?? null;
  } catch {
    return null;
  }
}

export const config = {
  // 정적 자산과 Next 내부 경로는 제외
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png).*)"],
};
