"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Cursor, STAFF_STATUS_LABEL, Staff } from "@/lib/types";
import { Badge, Button, ErrorBox, PageHeader, inputClass } from "@/components/ui";
import { Column, DataTable } from "@/components/data-table";
import { useStaff } from "@/components/app-shell";
import { AdminForm } from "./admin-form";

export default function AdminsPage() {
  const me = useStaff();
  const [admins, setAdmins] = useState<Staff[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);

  // 첫 await 이전에 setState 를 호출하지 않는다 (effect 내 동기 setState 금지)
  const load = useCallback(async (keyword: string) => {
    const params = keyword ? `?q=${encodeURIComponent(keyword)}` : "";
    try {
      const res = await api.get<Cursor<Staff>>(`/admins${params}`);
      setAdmins(res.items);
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

  async function toggleStatus(admin: Staff) {
    const next = admin.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const verb = next === "SUSPENDED" ? "정지" : "활성화";
    if (!confirm(`${admin.name}(${admin.loginId}) 계정을 ${verb}할까요?`)) return;
    try {
      await api.patch(`/admins/${admin.id}`, { status: next });
      refresh(q);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "상태 변경에 실패했습니다.",
      );
    }
  }

  const columns: Column<Staff>[] = [
    {
      key: "loginId",
      header: "계정",
      primary: true,
      className: "font-medium",
      cell: (a) => (
        <span className="break-all">
          {a.loginId}
          {a.id === me?.sub && (
            <span className="ml-2 text-xs font-normal text-muted">(나)</span>
          )}
        </span>
      ),
    },
    { key: "name", header: "이름", cell: (a) => a.name },
    {
      key: "phone",
      header: "연락처",
      className: "text-muted",
      cell: (a) => a.phone ?? "-",
    },
    {
      key: "status",
      header: "상태",
      cell: (a) => (
        <Badge tone={a.status === "ACTIVE" ? "success" : "danger"}>
          {STAFF_STATUS_LABEL[a.status]}
        </Badge>
      ),
    },
    {
      key: "lastLoginAt",
      header: "최근 로그인",
      className: "text-muted",
      cell: (a) =>
        a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString("ko-KR") : "-",
    },
  ];

  return (
    <div>
      <PageHeader
        title="관리자"
        description="K-DREAM 내부 직원 계정입니다. 전체 학생·서류·에이전트를 볼 수 있습니다."
        action={
          <Button className="w-full sm:w-auto" onClick={() => setCreating(true)}>
            계정 생성
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
          placeholder="계정 · 이름 검색"
        />
        <Button type="submit" variant="secondary" className="shrink-0">
          검색
        </Button>
      </form>

      <DataTable
        columns={columns}
        rows={admins}
        loading={loading}
        empty="등록된 관리자가 없습니다."
        actions={(admin) => (
          <>
            <Button size="sm" variant="secondary" onClick={() => setEditing(admin)}>
              수정
            </Button>
            {/* 본인 계정은 정지할 수 없다 (서버에서도 막는다) */}
            {admin.id !== me?.sub && (
              <Button
                size="sm"
                variant={admin.status === "ACTIVE" ? "danger" : "secondary"}
                className="ml-2"
                onClick={() => void toggleStatus(admin)}
              >
                {admin.status === "ACTIVE" ? "정지" : "활성화"}
              </Button>
            )}
          </>
        )}
      />

      {creating && (
        <AdminForm
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            refresh(q);
          }}
        />
      )}
      {editing && (
        <AdminForm
          admin={editing}
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
