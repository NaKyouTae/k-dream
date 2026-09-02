"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import {
  clearCredentials,
  loadCredentials,
  saveCredentials,
} from "@/lib/saved-credentials";

export default function LoginPage() {
  const router = useRouter();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const rememberRef = useRef<HTMLInputElement>(null);
  /** 프리필된 계정. 계정을 바꾸면 같이 채워둔 비밀번호를 비운다 */
  const prefilledIdRef = useRef<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // localStorage는 클라이언트에만 있으므로, 마운트 후 DOM 값을 직접 채운다.
  // (state로 채우면 SSR 결과와 하이드레이션이 어긋난다)
  useEffect(() => {
    const saved = loadCredentials();
    if (!saved) return;
    prefilledIdRef.current = saved.loginId;
    if (usernameRef.current) usernameRef.current.value = saved.loginId;
    if (passwordRef.current) passwordRef.current.value = saved.password;
    if (rememberRef.current) rememberRef.current.checked = true;
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const loginId = usernameRef.current?.value ?? "";
    const password = passwordRef.current?.value ?? "";
    const remember = rememberRef.current?.checked ?? false;

    setError(null);
    setSubmitting(true);
    try {
      await api.post("/auth/login", { loginId, password });
      if (remember) {
        saveCredentials({ loginId, password });
      } else {
        clearCredentials();
      }
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#0A2A5E]">
            K-Dream
          </h1>
          <p className="mt-1 text-sm text-muted">관리자 콘솔</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
        >
          <label className="block text-sm font-medium" htmlFor="username">
            아이디
          </label>
          <input
            id="username"
            name="username"
            ref={usernameRef}
            autoComplete="username"
            required
            onChange={(e) => {
              // 다른 계정을 입력하면 프리필된 비밀번호는 의미가 없다
              if (
                prefilledIdRef.current !== null &&
                e.target.value !== prefilledIdRef.current &&
                passwordRef.current
              ) {
                passwordRef.current.value = "";
                prefilledIdRef.current = null;
              }
            }}
            className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-base outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/15 md:text-sm"
            placeholder="계정"
          />

          <label className="mt-4 block text-sm font-medium" htmlFor="password">
            비밀번호
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="mt-1.5 w-full rounded-lg border border-border py-2.5 pr-12 pl-3 text-base outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/15 md:text-sm"
              placeholder="비밀번호"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
              aria-pressed={showPassword}
              className="absolute top-1.5 right-0 flex h-[calc(100%-0.375rem)] w-11 cursor-pointer items-center justify-center rounded-r-lg text-muted hover:text-foreground"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <label
            htmlFor="remember"
            className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-sm text-muted select-none"
          >
            <input
              id="remember"
              name="remember"
              ref={rememberRef}
              type="checkbox"
              onChange={(e) => {
                // 체크를 해제하면 저장돼 있던 정보를 즉시 지운다.
                if (!e.target.checked) clearCredentials();
              }}
              className="size-4 cursor-pointer accent-[#2F6BFF]"
            />
            계정 정보 저장
          </label>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full cursor-pointer rounded-lg border border-transparent bg-[#2F6BFF] py-2.5 text-base font-semibold text-white transition-colors hover:bg-[#2559d8] disabled:opacity-60 md:text-sm"
          >
            {submitting ? "로그인 중…" : "로그인"}
          </button>

          <p className="mt-4 text-center text-xs text-muted">
            이 브라우저에만 저장됩니다. 공용 PC에서는 사용하지 마세요.
          </p>
        </form>
      </div>
    </div>
  );
}

const ICON_PROPS = {
  width: 18,
  height: 18,
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function EyeIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M1.5 10S4.7 4.5 10 4.5 18.5 10 18.5 10 15.3 15.5 10 15.5 1.5 10 1.5 10Z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M8.2 4.7A7.9 7.9 0 0 1 10 4.5c5.3 0 8.5 5.5 8.5 5.5a15 15 0 0 1-2.4 3.1M5 5.9A15 15 0 0 0 1.5 10S4.7 15.5 10 15.5c1.4 0 2.6-.4 3.7-.9" />
      <path d="M8.2 8.2a2.5 2.5 0 0 0 3.5 3.5" />
      <path d="M2.5 2.5l15 15" />
    </svg>
  );
}
