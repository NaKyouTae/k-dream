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
import { ErrorBox, LinkButton, PageHeader } from "@/components/ui";

interface Stat {
  label: string;
  value: number;
  href: string;
  /** 지금 손봐야 하는 항목을 눈에 띄게 한다 */
  tone?: "primary" | "danger";
}

/** 대시보드 맨 위에 띄우는 할 일 안내 */
interface ActionCall {
  message: string;
  cta: string;
  href: string;
  tone: "primary" | "danger";
}

interface Dashboard {
  students: Stat[];
  /** 관리자만 본다 */
  operations: Stat[] | null;
  /** 처리할 게 없으면 null */
  action: ActionCall | null;
}

async function fetchDashboard(admin: boolean): Promise<Dashboard> {
  const counts = await api.get<Record<string, number>>(
    "/students/status-counts",
  );
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  // 학생 지표는 두 역할 모두 같은 항목을 본다. 서버가 범위를 갈라준다:
  // 관리자는 전체 학생, 에이전트는 본인이 등록한 학생.
  // 역할마다 지금 봐야 하는 상태가 다르다.
  // 관리자는 자기가 처리할 검토 건, 에이전트는 보완이 걸린 본인 학생.
  const emphasis: Partial<Record<string, Stat["tone"]>> = admin
    ? { REVIEW_REQUESTED: "primary", REVIEWING: "primary" }
    : { SUPPLEMENT_REQUIRED: "danger" };

  const students: Stat[] = [
    { label: admin ? "전체 학생" : "내 학생", value: total, href: "/students" },
    ...STUDENT_STATUS_ORDER.map((s) => ({
      label: STUDENT_STATUS_LABEL[s],
      value: counts[s] ?? 0,
      href: `/students?status=${s}`,
      tone: emphasis[s],
    })),
  ];

  const action = buildAction(admin, counts);

  if (!admin) return { students, operations: null, action };

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
    action,
    operations: [
      { label: "활성 에이전트", value: active(agents.items), href: "/agents" },
      { label: "등록 학교", value: schools.items.length, href: "/schools" },
      { label: "관리자", value: active(admins.items), href: "/admins" },
    ],
  };
}

/** 지금 처리해야 할 게 있으면 안내 문구를 만든다 */
function buildAction(
  admin: boolean,
  counts: Record<string, number>,
): ActionCall | null {
  if (admin) {
    const n = counts.REVIEW_REQUESTED ?? 0;
    if (n === 0) return null;
    return {
      message: `검토할 요청이 ${n}건 있습니다.`,
      cta: "검토하러 가기",
      href: "/students?status=REVIEW_REQUESTED",
      tone: "primary",
    };
  }
  const n = counts.SUPPLEMENT_REQUIRED ?? 0;
  if (n === 0) return null;
  return {
    message: `서류 보완할 학생이 ${n}명 있습니다.`,
    cta: "보완하러 가기",
    href: "/students?status=SUPPLEMENT_REQUIRED",
    tone: "danger",
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

      {data?.action && <ActionBanner action={data.action} />}

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

/** 기본 타일은 무채색, 지금 처리할 항목만 색을 준다 */
const TILE_TONE: Record<string, string> = {
  default:
    "border-border bg-surface text-muted hover:border-[#2F6BFF]/40",
  primary:
    "border-[#2F6BFF]/30 bg-[#2F6BFF]/[0.06] text-[#2F6BFF] hover:border-[#2F6BFF]/60",
  danger: "border-red-200 bg-red-50 text-red-600 hover:border-red-300",
};

function ActionBanner({ action }: { action: ActionCall }) {
  const styles =
    action.tone === "danger"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-[#2F6BFF]/30 bg-[#2F6BFF]/[0.06] text-[#0A2A5E]";

  return (
    <div
      className={`mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3.5 ${styles}`}
    >
      <p className="font-semibold break-keep">{action.message}</p>
      <LinkButton
        href={action.href}
        size="sm"
        variant={action.tone === "danger" ? "danger" : "primary"}
        className="shrink-0"
      >
        {action.cta}
      </LinkButton>
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
      {/*
        모바일에서는 입력칸 높이의 한 줄짜리로 둔다. 라벨과 값을 위아래로
        쌓으면 카드 하나가 100px 가까이 되어 지표 몇 개에 화면을 다 쓴다.
        md 이상에서는 원래대로 크게 보여준다.
      */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-5">
        {cells.map((stat, i) => (
          <Link
            key={stat?.label ?? i}
            href={stat?.href ?? "#"}
            className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 transition-colors md:block md:rounded-2xl md:p-5 ${TILE_TONE[stat?.tone ?? "default"]}`}
          >
            <span className="truncate text-sm whitespace-nowrap">
              {stat?.label ?? "…"}
            </span>
            <span className="shrink-0 text-base font-bold md:mt-2 md:block md:text-2xl">
              {stat?.value ?? "—"}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
