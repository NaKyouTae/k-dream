"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { api } from "@/lib/api";
import { Me } from "@/lib/types";

const StaffContext = createContext<Me | null>(null);

/** 로그인한 staff. 로딩 중에는 null */
export function useStaff() {
  return useContext(StaffContext);
}

export function AppShell({
  children,
  initialStaff,
}: {
  children: React.ReactNode;
  /** 서버 레이아웃이 쿠키에서 읽어 넘겨준 값 (첫 렌더용) */
  initialStaff: Me | null;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const [me, setMe] = useState<Me | null>(initialStaff);

  useEffect(() => {
    // API 서버 기준으로 한 번 더 확인한다 (쿠키 만료/변경 대비)
    // 프로미스 콜백 안에서만 setState 한다 (effect 동기 setState 금지)
    void api
      .get<Me>("/auth/me")
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  return (
    <StaffContext.Provider value={me}>
      <div className="flex min-h-screen">
        {/* 모바일에서 드로어가 열렸을 때만 깔리는 배경 */}
        {navOpen && (
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={() => setNavOpen(false)}
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
          />
        )}

        <Sidebar
          open={navOpen}
          onNavigate={() => setNavOpen(false)}
          me={me}
        />

        {/*
          모바일 상단 막대.
          사이드바가 숨겨져 있어 서비스명을 볼 곳이 없었다. 떠 있는 메뉴
          버튼만 두면 어느 서비스인지 알 수 없어 막대로 바꿨다.
        */}
        <header className="fixed inset-x-0 top-0 z-20 flex h-14 items-center gap-1 border-b border-border bg-surface px-2 md:hidden">
          <button
            type="button"
            aria-label="메뉴 열기"
            onClick={() => setNavOpen(true)}
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-black/[0.04]"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
          <span className="font-bold tracking-tight text-[#0A2A5E]">
            K-Dream
          </span>
          <span className="truncate text-xs text-muted">관리자 콘솔</span>
        </header>

        {/* 모바일은 고정된 상단 막대만큼 위쪽을 비운다 */}
        <main className="min-w-0 flex-1 px-4 pt-18 pb-6 md:p-6">{children}</main>
      </div>
    </StaffContext.Provider>
  );
}
