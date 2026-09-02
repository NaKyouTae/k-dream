"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import {
  COUNTRY_LABEL,
  Cursor,
  PROGRAM_LABEL,
  STUDENT_STATUS_LABEL,
  STUDENT_STATUS_ORDER,
  STUDENT_STATUS_TONE,
  StudentListItem,
  StudentStatus,
} from "@/lib/types";
import {
  Badge,
  Button,
  ErrorBox,
  LinkButton,
  PageHeader,
  inputClass,
} from "@/components/ui";
import { useStaff } from "@/components/app-shell";
import { Column, DataTable } from "@/components/data-table";
import { StudentForm } from "./student-form";

type Filter = StudentStatus | "ALL";

export default function StudentsPage() {
  const me = useStaff();
  const isAdmin = me?.type === "ADMIN";
  // 대시보드 카드가 ?status=... 로 넘어온다
  const initialStatus = asFilter(useSearchParams().get("status"));
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<Filter>(initialStatus);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // 첫 await 이전에 setState 를 호출하지 않는다 (effect 내 동기 setState 금지)
  const load = useCallback(async (status: Filter, keyword: string) => {
    const params = new URLSearchParams();
    if (status !== "ALL") params.set("status", status);
    if (keyword) params.set("q", keyword);
    const qs = params.toString() ? `?${params}` : "";
    try {
      const [res, countRes] = await Promise.all([
        api.get<Cursor<StudentListItem>>(`/students${qs}`),
        api.get<Record<string, number>>("/students/status-counts"),
      ]);
      setStudents(res.items);
      setCounts(countRes);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "목록을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(
    (status: Filter, keyword: string) => {
      setLoading(true);
      void load(status, keyword);
    },
    [load],
  );

  useEffect(() => {
    // 프로미스 콜백 안에서만 setState 한다 (effect 동기 setState 금지)
    void Promise.resolve().then(() => load(initialStatus, ""));
  }, [load, initialStatus]);

  const total = STUDENT_STATUS_ORDER.reduce((n, s) => n + (counts[s] ?? 0), 0);
  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "ALL", label: "전체", count: total },
    ...STUDENT_STATUS_ORDER.map((s) => ({
      key: s as Filter,
      label: STUDENT_STATUS_LABEL[s],
      count: counts[s] ?? 0,
    })),
  ];

  const columns: Column<StudentListItem>[] = [
    {
      key: "student",
      header: "학생",
      primary: true,
      // 행 전체가 클릭 가능하고 오른쪽에 상세 버튼이 있어 이름은 링크로 두지 않는다
      cell: (s) => (
        <>
          <div className="font-medium">{s.passportName}</div>
          <div className="text-xs text-muted">{s.studentNo}</div>
        </>
      ),
    },
    {
      key: "country",
      header: "국가",
      cell: (s) => COUNTRY_LABEL[s.countryCode],
    },
    {
      key: "program",
      header: "희망과정",
      cell: (s) => (
        <>
          {PROGRAM_LABEL[s.desiredProgram]}
          {s.desiredMajor && (
            <span className="ml-1.5 text-xs text-muted">{s.desiredMajor}</span>
          )}
        </>
      ),
    },
    {
      key: "school",
      header: "신청 학교",
      className: "text-muted",
      cell: (s) => s.school?.nameKo ?? "-",
    },
    ...(isAdmin
      ? [
          {
            key: "agent",
            header: "에이전트",
            className: "text-muted",
            cell: (s: StudentListItem) => s.agent.name,
          },
        ]
      : []),
    {
      key: "documents",
      header: "서류",
      cell: (s) => `${s._count.documents}건`,
    },
    {
      key: "status",
      header: "상태",
      cell: (s) => (
        <Badge tone={STUDENT_STATUS_TONE[s.status]}>
          {STUDENT_STATUS_LABEL[s.status]}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "등록일",
      className: "whitespace-nowrap text-muted",
      cell: (s) => new Date(s.createdAt).toLocaleDateString("ko-KR"),
    },
  ];

  return (
    <div>
      <PageHeader
        title="학생"
        description={
          isAdmin
            ? "모든 에이전트가 등록한 학생입니다. 검토요청 건을 열어 서류를 확인하고 상태를 변경합니다."
            : "본인이 등록한 학생만 표시됩니다."
        }
        action={
          me ? (
            <Button className="w-full sm:w-auto" onClick={() => setCreating(true)}>
              학생 등록
            </Button>
          ) : undefined
        }
      />

      {error && <ErrorBox message={error} />}

      {/* 상태 필터 — 모바일에서는 가로 스크롤 */}
      <div className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setFilter(tab.key);
                refresh(tab.key, q);
              }}
              className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm whitespace-nowrap transition-colors ${
                filter === tab.key
                  ? "border-[#2F6BFF] bg-[#2F6BFF]/10 font-semibold text-[#2F6BFF]"
                  : "border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          refresh(filter, q);
        }}
      >
        <input
          className={`${inputClass} sm:max-w-xs`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="학생번호 · 여권영문명 검색"
        />
        <Button type="submit" variant="secondary" className="shrink-0">
          검색
        </Button>
      </form>

      <DataTable
        columns={columns}
        rows={students}
        loading={loading}
        rowHref={(student) => `/students/${student.id}`}
        empty={
          filter === "ALL"
            ? isAdmin
              ? "등록된 학생이 없습니다. 에이전트가 등록하면 여기에 표시됩니다."
              : "등록한 학생이 없습니다."
            : `${STUDENT_STATUS_LABEL[filter]} 상태인 학생이 없습니다.`
        }
        actions={(student) => (
          <LinkButton href={`/students/${student.id}`} size="sm">
            {isAdmin ? "검토" : "상세"}
          </LinkButton>
        )}
      />

      {creating && (
        <StudentForm
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            refresh(filter, q);
          }}
        />
      )}
    </div>
  );
}

function asFilter(value: string | null): Filter {
  return value && STUDENT_STATUS_ORDER.includes(value as StudentStatus)
    ? (value as Filter)
    : "ALL";
}
