"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useStaff } from "@/components/app-shell";
import {
  Agent,
  Cursor,
  School,
  STUDENT_STATUS_LABEL,
  STUDENT_STATUS_ORDER,
  Staff,
} from "@/lib/types";
import { ErrorBox, PageHeader } from "@/components/ui";

interface Stat {
  label: string;
  value: number;
  href: string;
}

interface Dashboard {
  students: Stat[];
  /** 관리자만 본다 */
  operations: Stat[] | null;
}

async function fetchDashboard(admin: boolean): Promise<Dashboard> {
  const counts = await api.get<Record<string, number>>(
    "/students/status-counts",
  );
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  // 학생 지표는 두 역할 모두 같은 항목을 본다. 서버가 범위를 갈라준다:
  // 관리자는 전체 학생, 에이전트는 본인이 등록한 학생.
  const students: Stat[] = [
    { label: admin ? "전체 학생" : "내 학생", value: total, href: "/students" },
    ...STUDENT_STATUS_ORDER.map((s) => ({
      label: STUDENT_STATUS_LABEL[s],
      value: counts[s] ?? 0,
      href: `/students?status=${s}`,
    })),
  ];

  if (!admin) return { students, operations: null };

  // 운영 지표는 관리자 전용 API 라 에이전트가 부르면 403 이다.
  const [agents, schools, admins] = await Promise.all([
    api.get<Cursor<Agent>>("/agents?limit=100"),
    api.get<Cursor<School>>("/schools?limit=100"),
    api.get<Cursor<Staff>>("/admins?limit=100"),
  ]);
  const active = <T extends { status: string }>(rows: T[]) =>
    rows.filter((r) => r.status === "ACTIVE").length;

  return {
    students,
    operations: [
      { label: "활성 에이전트", value: active(agents.items), href: "/agents" },
      { label: "등록 학교", value: schools.items.length, href: "/schools" },
      { label: "관리자", value: active(admins.items), href: "/admins" },
    ],
  };
}

export default function DashboardPage() {
  const me = useStaff();
  const isAdmin = me?.type === "ADMIN";
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 실패해도 화면이 로딩 상태로 멈추지 않게 반드시 잡는다.
  // (세션이 끊긴 401 이면 api 계층이 로그인 화면으로 보낸다)
  const load = useCallback(async (admin: boolean) => {
    try {
      setData(await fetchDashboard(admin));
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "현황을 불러오지 못했습니다.",
      );
    }
  }, []);

  useEffect(() => {
    // 역할을 알아야 어떤 API 를 부를지 정할 수 있다
    if (!me) return;
    void Promise.resolve().then(() => load(me.type === "ADMIN"));
  }, [load, me]);

  return (
    <div>
      <PageHeader
        title="대시보드"
        description={
          isAdmin
            ? "모든 에이전트가 등록한 학생 기준입니다."
            : "본인이 등록한 학생 기준입니다."
        }
      />

      {error && <ErrorBox message={error} />}

      <StatGrid
        title="학생 현황"
        stats={data?.students ?? null}
        placeholderCount={5}
      />

      {isAdmin && (
        <StatGrid
          title="운영 현황"
          stats={data?.operations ?? null}
          placeholderCount={3}
        />
      )}
    </div>
  );
}

function StatGrid({
  title,
  stats,
  placeholderCount,
}: {
  title: string;
  stats: Stat[] | null;
  placeholderCount: number;
}) {
  const cells: (Stat | null)[] =
    stats ?? Array.from({ length: placeholderCount }, () => null);

  return (
    <section className="mb-6 last:mb-0">
      <h2 className="mb-3 text-sm font-semibold text-muted">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {cells.map((stat, i) => (
          <Link
            key={stat?.label ?? i}
            href={stat?.href ?? "#"}
            className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-[#2F6BFF]/40"
          >
            <div className="truncate text-sm whitespace-nowrap text-muted">
              {stat?.label ?? "…"}
            </div>
            <div className="mt-2 text-2xl font-bold">{stat?.value ?? "—"}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
