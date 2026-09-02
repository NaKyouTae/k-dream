"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import {
  Cursor,
  SCHOOL_STATUS_LABEL,
  SCHOOL_TYPE_LABEL,
  School,
} from "@/lib/types";
import { Badge, Button, ErrorBox, PageHeader, inputClass } from "@/components/ui";
import { Column, DataTable } from "@/components/data-table";
import { SchoolForm } from "./school-form";

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<School | null>(null);

  // 첫 await 이전에 setState 를 호출하지 않는다 (effect 내 동기 setState 금지)
  const load = useCallback(async (keyword: string) => {
    const params = keyword ? `?q=${encodeURIComponent(keyword)}` : "";
    try {
      const res = await api.get<Cursor<School>>(`/schools${params}`);
      setSchools(res.items);
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
    (keyword: string) => {
      setLoading(true);
      void load(keyword);
    },
    [load],
  );

  useEffect(() => {
    // 프로미스 콜백 안에서만 setState 한다 (effect 동기 setState 금지)
    void Promise.resolve().then(() => load(""));
  }, [load]);

  async function remove(school: School) {
    if (!confirm(`${school.nameKo}를 삭제할까요?`)) return;
    try {
      await api.delete(`/schools/${school.id}`);
      refresh(q);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "삭제에 실패했습니다.");
    }
  }

  const columns: Column<School>[] = [
    {
      key: "name",
      header: "학교명",
      primary: true,
      cell: (s) => (
        <>
          <div className="font-medium">{s.nameKo}</div>
          {s.nameEn && <div className="text-xs text-muted">{s.nameEn}</div>}
        </>
      ),
    },
    { key: "type", header: "과정", cell: (s) => SCHOOL_TYPE_LABEL[s.type] },
    {
      key: "region",
      header: "지역",
      className: "text-muted",
      cell: (s) => s.region ?? "-",
    },
    {
      key: "students",
      header: "신청 학생",
      cell: (s) => `${s._count.students}명`,
    },
    {
      key: "status",
      header: "상태",
      cell: (s) => (
        <Badge tone={s.status === "ACTIVE" ? "success" : "neutral"}>
          {SCHOOL_STATUS_LABEL[s.status]}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="학교"
        description="학생이 신청할 수 있는 학교 목록입니다. 관리자가 직접 추가·수정합니다."
        action={
          <Button className="w-full sm:w-auto" onClick={() => setCreating(true)}>
            학교 등록
          </Button>
        }
      />

      {error && <ErrorBox message={error} />}

      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          refresh(q);
        }}
      >
        <input
          className={`${inputClass} sm:max-w-xs`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="학교명 · 지역 검색"
        />
        <Button type="submit" variant="secondary" className="shrink-0">
          검색
        </Button>
      </form>

      <DataTable
        columns={columns}
        rows={schools}
        loading={loading}
        empty="등록된 학교가 없습니다."
        actions={(school) => (
          <>
            <Button size="sm" variant="secondary" onClick={() => setEditing(school)}>
              수정
            </Button>
            <Button
              size="sm"
              variant="danger"
              className="ml-2"
              onClick={() => void remove(school)}
            >
              삭제
            </Button>
          </>
        )}
      />

      {creating && (
        <SchoolForm
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            refresh(q);
          }}
        />
      )}
      {editing && (
        <SchoolForm
          school={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh(q);
          }}
        />
      )}
    </div>
  );
}
