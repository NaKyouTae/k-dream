"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { Me, STAFF_TYPE_LABEL, StaffType } from "@/lib/types";
import { clearCredentials } from "@/lib/saved-credentials";

const NAV_ITEMS: { href: string; label: string; roles: StaffType[] }[] = [
  { href: "/", label: "대시보드", roles: ["ADMIN", "AGENT"] },
  { href: "/admins", label: "관리자", roles: ["ADMIN"] },
  { href: "/agents", label: "에이전트", roles: ["ADMIN"] },
  { href: "/schools", label: "학교", roles: ["ADMIN"] },
  { href: "/students", label: "학생", roles: ["ADMIN", "AGENT"] },
  { href: "/audit-logs", label: "감사로그", roles: ["ADMIN"] },
];

interface Props {
  /** 모바일 드로어 열림 여부. 데스크톱(md+)에서는 항상 보인다 */
  open?: boolean;
  onNavigate?: () => void;
  me: Me | null;
}

export function Sidebar({ open = false, onNavigate, me }: Props) {
  const pathname = usePathname();
  // 역할을 알기 전에는 두 역할 공통 메뉴만 보여준다
  const items = NAV_ITEMS.filter((item) =>
    me ? item.roles.includes(me.type) : item.roles.length === 2,
  );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface transition-transform duration-200 md:sticky md:top-0 md:w-56 md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-14 shrink-0 items-center px-6 text-lg font-bold tracking-tight text-[#0A2A5E]">
        K-Dream
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`block rounded-lg px-3 py-2.5 text-sm transition-colors md:py-2 ${
                active
                  ? "bg-[#2F6BFF]/10 font-semibold text-[#2F6BFF]"
                  : "text-muted hover:bg-black/[0.03] hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* 헤더에 있던 로그인 정보와 로그아웃을 여기로 옮겼다 */}
      <div className="shrink-0 border-t border-border p-3">
        {me && (
          <div className="px-2 pb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-medium">{me.name}</span>
              <span className="shrink-0 rounded-full bg-black/[0.05] px-1.5 py-0.5 text-[11px] text-muted">
                {STAFF_TYPE_LABEL[me.type]}
              </span>
            </div>
            <div className="truncate text-xs text-muted">{me.loginId}</div>
          </div>
        )}
        <LogoutButton />
      </div>
    </aside>
  );
}

function LogoutButton() {
  async function handleLogout() {
    // 브라우저에 남은 계정 정보를 먼저 지운다.
    // 서버 호출이 실패해도 이 단말에는 아무것도 남지 않아야 한다.
    clearCredentials();
    try {
      await api.post("/auth/logout");
    } catch {
      // 쿠키가 이미 만료됐어도 로그인 화면으로는 보낸다
    } finally {
      // proxy 가 쿠키를 다시 확인하도록 전체 리로드한다
      window.location.href = "/login";
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      className="w-full cursor-pointer rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:bg-black/[0.03] hover:text-foreground"
    >
      로그아웃
    </button>
  );
}
