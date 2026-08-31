"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // TODO: 서버 인증 연동 (POST /auth/login) — 현재는 레이아웃 스켈레톤만 제공
    router.push("/");
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
          <label className="block text-sm font-medium" htmlFor="email">
            이메일
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/15"
            placeholder="admin@k-dream.kr"
          />

          <label
            className="mt-4 block text-sm font-medium"
            htmlFor="password"
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/15"
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full cursor-pointer rounded-lg bg-[#2F6BFF] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2559d8] disabled:opacity-60"
          >
            {submitting ? "로그인 중…" : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
