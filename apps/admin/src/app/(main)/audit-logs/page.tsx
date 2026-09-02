"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { AUDIT_ACTION_LABEL, AuditLog, Cursor } from "@/lib/types";
import { Badge, Button, ErrorBox, PageHeader } from "@/components/ui";
import { Column, DataTable } from "@/components/data-table";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 첫 await 이전에 setState 를 호출하지 않는다 (effect 내 동기 setState 금지)
  const load = useCallback(async (cursor?: string) => {
    const params = cursor ? `?cursor=${cursor}` : "";
    try {
      const res = await api.get<Cursor<AuditLog>>(`/audit-logs${params}`);
      setLogs((prev) => (cursor ? [...prev, ...res.items] : res.items));
      setNextCursor(res.nextCursor);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "감사로그를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 프로미스 콜백 안에서만 setState 한다 (effect 동기 setState 금지)
    void Promise.resolve().then(() => load());
  }, [load]);

  const columns: Column<AuditLog>[] = [
    {
      key: "createdAt",
      header: "시각",
      className: "whitespace-nowrap text-muted",
      cell: (log) => new Date(log.createdAt).toLocaleString("ko-KR"),
    },
    {
      key: "actor",
      header: "실행자",
      cell: (log) =>
        log.actor ? (
          <>
            <span className="font-medium">{log.actor.name}</span>
            <span className="ml-1.5 text-xs break-all text-muted">
              {log.actor.loginId}
            </span>
          </>
        ) : (
          <span className="text-muted">-</span>
        ),
    },
    {
      key: "action",
      header: "액션",
      // 모바일 카드에서는 액션이 제목이 된다
      primary: true,
      cell: (log) => (
        <Badge tone="info">
          {AUDIT_ACTION_LABEL[log.actionCode] ?? log.actionCode}
        </Badge>
      ),
    },
    {
      key: "entityType",
      header: "대상",
      className: "text-muted",
      cell: (log) => log.entityType,
    },
    {
      key: "detail",
      header: "상세",
      className: "max-w-xs truncate text-xs text-muted",
      cell: (log) => (log.detail ? JSON.stringify(log.detail) : "-"),
    },
    {
      key: "ip",
      header: "IP",
      className: "text-xs text-muted",
      cell: (log) => log.ipAddress ?? "-",
    },
  ];

  return (
    <div>
      <PageHeader
        title="감사로그"
        description="관리자 사이트에서 실행한 액션 기록입니다."
      />

      {error && <ErrorBox message={error} />}

      <DataTable
        columns={columns}
        rows={logs}
        loading={loading && logs.length === 0}
        empty="기록이 없습니다."
      />

      {nextCursor && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="secondary"
            disabled={loading}
            onClick={() => {
              setLoading(true);
              void load(nextCursor);
            }}
          >
            {loading ? "불러오는 중…" : "더 보기"}
          </Button>
        </div>
      )}
    </div>
  );
}
