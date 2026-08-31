"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "대시보드" },
  { href: "/inquiries", label: "상담문의" },
  { href: "/programs", label: "프로그램" },
  { href: "/partners", label: "제휴기관" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-surface">
      <div className="flex h-14 items-center px-6 text-lg font-bold tracking-tight text-[#0A2A5E]">
        K-Dream
      </div>
      <nav className="px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
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
    </aside>
  );
}
