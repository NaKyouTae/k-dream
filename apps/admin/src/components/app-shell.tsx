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

        {/* 헤더가 없으므로 모바일에서는 떠 있는 버튼으로 드로어를 연다 */}
        {!navOpen && (
          <button
            type="button"
            aria-label="메뉴 열기"
            onClick={() => setNavOpen(true)}
            className="fixed top-3 left-3 z-30 flex size-10 items-center justify-center rounded-lg border border-border bg-surface text-muted shadow-sm md:hidden"
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
        )}

        {/* 모바일은 떠 있는 메뉴 버튼과 겹치지 않도록 위쪽을 비운다 */}
        <main className="min-w-0 flex-1 px-4 pt-16 pb-6 md:p-6">{children}</main>
      </div>
    </StaffContext.Provider>
  );
}
