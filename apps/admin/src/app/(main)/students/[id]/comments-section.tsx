"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useStaff } from "@/components/app-shell";
import { STAFF_TYPE_LABEL, StaffType } from "@/lib/types";
import { Button, ErrorBox, inputClass } from "@/components/ui";

interface StudentComment {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string; type: StaffType };
}

/**
 * 관리자와 에이전트가 학생 건에 대해 주고받는 메모.
 * reviewNote 는 덮어쓰기라 이전 내용이 사라지므로, 오간 맥락은 여기에 쌓인다.
 */
export function CommentsSection({ studentId }: { studentId: string }) {
  const me = useStaff();
  const [comments, setComments] = useState<StudentComment[] | null>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(
    () =>
      api
        .get<StudentComment[]>(`/students/${studentId}/comments`)
        .then(setComments),
    [studentId],
  );

  useEffect(() => {
    // 프로미스 콜백 안에서만 setState 한다 (effect 동기 setState 금지)
    load().catch(() => setComments([]));
  }, [load]);

  async function submit() {
    const text = body.trim();
    if (!text) return;
    setError(null);
    setBusy("create");
    try {
      await api.post(`/students/${studentId}/comments`, { body: text });
      setBody("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "등록에 실패했습니다.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("이 메모를 삭제할까요?")) return;
    setError(null);
    setBusy(`delete:${id}`);
    try {
      await api.delete(`/comments/${id}`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "삭제에 실패했습니다.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mb-4 rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <h2 className="mb-3 font-semibold">
        메모 {comments ? `(${comments.length}건)` : ""}
      </h2>

      {error && <ErrorBox message={error} />}

      {comments === null ? (
        <p className="py-2 text-sm text-muted">불러오는 중…</p>
      ) : comments.length === 0 ? (
        <p className="py-2 text-sm text-muted">
          아직 주고받은 메모가 없습니다. 진행 상황이나 전달할 내용을 남겨보세요.
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => {
            const mine = comment.author.id === me?.sub;
            return (
              <li key={comment.id} className="text-sm">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium">{comment.author.name}</span>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[11px] ${
                      comment.author.type === "ADMIN"
                        ? "bg-[#2F6BFF]/10 text-[#2F6BFF]"
                        : "bg-black/[0.05] text-muted"
                    }`}
                  >
                    {STAFF_TYPE_LABEL[comment.author.type]}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {new Date(comment.createdAt).toLocaleString("ko-KR")}
                  </span>
                  {/* 본인 것만 지울 수 있다. 관리자는 모두 (서버도 같게 막는다) */}
                  {(mine || me?.type === "ADMIN") && (
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() => void remove(comment.id)}
                      className="ml-auto shrink-0 cursor-pointer text-xs text-muted hover:text-red-600 disabled:opacity-50"
                    >
                      삭제
                    </button>
                  )}
                </div>
                <p className="mt-0.5 whitespace-pre-wrap break-words">
                  {comment.body}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 border-t border-border pt-4">
        <textarea
          className={`${inputClass} min-h-20`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            me?.type === "ADMIN"
              ? "에이전트에게 전달할 내용을 적어주세요."
              : "관리자에게 전달할 내용을 적어주세요. (예: TOPIK 성적은 다음 주 발표 예정입니다)"
          }
        />
        <Button
          className="mt-2"
          loading={busy === "create"}
          disabled={busy !== null || !body.trim()}
          onClick={() => void submit()}
        >
          메모 남기기
        </Button>
      </div>
    </section>
  );
}
