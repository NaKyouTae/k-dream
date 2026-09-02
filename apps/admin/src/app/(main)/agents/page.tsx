"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Agent, COUNTRY_LABEL, Cursor, STAFF_STATUS_LABEL } from "@/lib/types";
import { Badge, Button, ErrorBox, PageHeader, inputClass } from "@/components/ui";
import { Column, DataTable } from "@/components/data-table";
import { AgentForm } from "./agent-form";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);

  // 첫 await 이전에 setState 를 호출하지 않는다 (effect 내 동기 setState 금지)
  const load = useCallback(async (keyword: string) => {
    const params = keyword ? `?q=${encodeURIComponent(keyword)}` : "";
    try {
      const res = await api.get<Cursor<Agent>>(`/agents${params}`);
      setAgents(res.items);
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

  async function toggleStatus(agent: Agent) {
    const next = agent.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const verb = next === "SUSPENDED" ? "정지" : "활성화";
    if (!confirm(`${agent.name}(${agent.loginId}) 계정을 ${verb}할까요?`)) return;
    try {
      await api.patch(`/agents/${agent.id}`, { status: next });
      refresh(q);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "상태 변경에 실패했습니다.",
      );
    }
  }

  const columns: Column<Agent>[] = [
    {
      key: "loginId",
      header: "계정",
      primary: true,
      className: "font-medium",
      cell: (a) => <span className="break-all">{a.loginId}</span>,
    },
    { key: "name", header: "담당자", cell: (a) => a.name },
    { key: "country", header: "국가", cell: (a) => COUNTRY_LABEL[a.countryCode] },
    {
      key: "organization",
      header: "기관명",
      className: "text-muted",
      cell: (a) => a.organization ?? "-",
    },
    { key: "students", header: "학생", cell: (a) => `${a._count.students}명` },
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
        title="에이전트"
        description="현지 에이전트 계정을 생성하고 관리합니다. 에이전트는 본인이 등록한 학생만 볼 수 있습니다."
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
          placeholder="계정 · 담당자명 · 기관명 검색"
        />
        <Button type="submit" variant="secondary" className="shrink-0">
          검색
        </Button>
      </form>

      <DataTable
        columns={columns}
        rows={agents}
        loading={loading}
        empty="등록된 에이전트가 없습니다."
        actions={(agent) => (
          <>
            <Button size="sm" variant="secondary" onClick={() => setEditing(agent)}>
              수정
            </Button>
            <Button
              size="sm"
              variant={agent.status === "ACTIVE" ? "danger" : "secondary"}
              className="ml-2"
              onClick={() => void toggleStatus(agent)}
            >
              {agent.status === "ACTIVE" ? "정지" : "활성화"}
            </Button>
          </>
        )}
      />

      {creating && (
        <AgentForm
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            refresh(q);
          }}
        />
      )}
      {editing && (
        <AgentForm
          agent={editing}
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
