"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * 인풋과 버튼이 공유하는 세로 크기.
 * 모바일은 text-base(16px) — 그보다 작으면 iOS 가 포커스 시 화면을 확대한다.
 */
export const CONTROL_BOX =
  "rounded-lg border py-2.5 text-base md:py-2 md:text-sm";

export const inputClass = `${CONTROL_BOX} w-full border-border bg-surface px-3 outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/15`;

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div>
        <h1 className="text-lg font-bold sm:text-xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

type Variant = "primary" | "secondary" | "danger";
type Size = "md" | "sm";

// 테두리 폭까지 포함해 inputClass 와 세로 크기가 정확히 같아야
// 검색창 옆에 나란히 놓았을 때 높이가 맞는다.
const VARIANT: Record<Variant, string> = {
  primary: "border-transparent bg-[#2F6BFF] text-white hover:bg-[#2559d8]",
  secondary: "border-border bg-surface hover:bg-black/[0.03]",
  danger: "border-red-200 bg-surface text-red-600 hover:bg-red-50",
};

/** sm 은 표 안의 행 액션용 */
const SIZE: Record<Size, string> = {
  md: `${CONTROL_BOX} px-3.5`,
  sm: "rounded-lg border px-2.5 py-1.5 text-sm",
};

function controlClass(variant: Variant, size: Size, className: string) {
  return `${SIZE[size]} cursor-pointer font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT[variant]} ${className}`;
}

/** 버튼 안에 들어가는 작은 회전 표시 */
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`size-3.5 shrink-0 animate-spin ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="6.5"
        stroke="currentColor"
        strokeWidth="2"
        className="opacity-25"
      />
      <path
        d="M8 1.5a6.5 6.5 0 0 1 6.5 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  /** 이 버튼의 작업이 진행 중임을 표시하고 중복 클릭을 막는다 */
  loading?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      aria-busy={loading || undefined}
      className={controlClass(
        variant,
        size,
        `inline-flex items-center justify-center gap-1.5 ${className}`,
      )}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

/**
 * 버튼처럼 보이는 링크. 이동은 진짜 <a> 라서 새 탭 열기와 프리페치가 유지된다.
 */
export function LinkButton({
  href,
  variant = "secondary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center ${controlClass(variant, size, className)}`}
    >
      {children}
    </Link>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    neutral: "bg-black/[0.05] text-muted",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-600",
    info: "bg-[#2F6BFF]/10 text-[#2F6BFF]",
  }[tone];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${styles}`}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0 sm:items-center sm:p-6"
      // 배경을 누르면 닫는다. click 이 아니라 mousedown 을 보는 이유는,
      // 모달 안에서 텍스트를 드래그하다 밖에서 손을 떼면 click 이 배경에서
      // 발생해 의도치 않게 닫히기 때문이다.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[92vh] w-full max-w-lg overflow-hidden rounded-t-2xl border border-border bg-surface shadow-lg sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="cursor-pointer rounded-md px-2 text-lg leading-none text-muted hover:text-foreground"
          >
            ×
          </button>
        </div>
        <div className="max-h-[calc(92vh-3.25rem)] overflow-y-auto p-5 sm:max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
      {message}
    </p>
  );
}
