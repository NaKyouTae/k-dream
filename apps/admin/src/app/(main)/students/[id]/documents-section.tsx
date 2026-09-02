"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useStaff } from "@/components/app-shell";
import {
  DOCUMENT_CATEGORY_LABEL,
  DOCUMENT_REVIEW_LABEL,
  DocumentCategory,
  DocumentReviewStatus,
  StudentDocument,
} from "@/lib/types";
import { Badge, Button, ErrorBox } from "@/components/ui";
import {
  CategorySelect,
  DocumentPicker,
  PickedFile,
  formatSize,
} from "@/components/document-picker";

const REVIEW_TONE: Record<
  DocumentReviewStatus,
  "success" | "danger" | "neutral"
> = {
  OK: "success",
  SUPPLEMENT_REQUIRED: "danger",
  NOT_REVIEWED: "neutral",
};

export function DocumentsSection({
  studentId,
  documents,
  onChanged,
}: {
  studentId: string;
  documents: StudentDocument[];
  onChanged: () => void | Promise<void>;
}) {
  const me = useStaff();
  const isAdmin = me?.type === "ADMIN";
  const [picked, setPicked] = useState<PickedFile[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * 같은 종류 안에서 최신 버전만 진하게 보여준다.
   * 미지정 서류는 서로 다른 파일이므로 버전으로 묶지 않는다.
   */
  const latestByCategory = new Map<string, StudentDocument>();
  for (const doc of documents) {
    if (!doc.category) continue;
    const current = latestByCategory.get(doc.category);
    if (!current || doc.versionNo > current.versionNo) {
      latestByCategory.set(doc.category, doc);
    }
  }

  async function run(label: string, job: () => Promise<unknown>) {
    setError(null);
    setBusy(label);
    try {
      await job();
      await onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "처리에 실패했습니다.");
    } finally {
      setBusy(null);
    }
  }

  async function upload() {
    await run("upload", async () => {
      for (const doc of picked) {
        const form = new FormData();
        if (doc.category) form.append("category", doc.category);
        form.append("file", doc.file);
        await api.upload(`/students/${studentId}/documents`, form);
      }
      setPicked([]);
    });
  }

  async function download(doc: StudentDocument) {
    await run(`download:${doc.id}`, async () => {
      const { url } = await api.get<{ url: string; fileName: string }>(
        `/documents/${doc.id}/download-url`,
      );
      // 로컬 개발 드라이버는 상대 경로를 돌려준다
      const target = url.startsWith("http")
        ? url
        : `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:17000"}${url}`;
      window.open(target, "_blank", "noopener");
    });
  }

  function setCategory(doc: StudentDocument, category: DocumentCategory | null) {
    void run(`category:${doc.id}`, () =>
      api.patch(`/documents/${doc.id}/category`, { category }),
    );
  }

  function review(doc: StudentDocument, reviewStatus: DocumentReviewStatus) {
    const reviewNote =
      reviewStatus === "SUPPLEMENT_REQUIRED"
        ? prompt("보완이 필요한 사유를 입력하세요.")?.trim()
        : undefined;
    if (reviewStatus === "SUPPLEMENT_REQUIRED" && !reviewNote) return;

    void run(`review:${doc.id}`, () =>
      api.patch(`/documents/${doc.id}/review`, { reviewStatus, reviewNote }),
    );
  }

  function remove(doc: StudentDocument) {
    const label = doc.category
      ? `${DOCUMENT_CATEGORY_LABEL[doc.category]} v${doc.versionNo}`
      : doc.originalFileName;
    if (!confirm(`${label} 을(를) 삭제할까요?`)) return;
    void run(`delete:${doc.id}`, () => api.delete(`/documents/${doc.id}`));
  }

  return (
    <section className="mb-4 rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <h2 className="mb-3 font-semibold">서류 ({documents.length}건)</h2>

      {error && <ErrorBox message={error} />}

      {documents.length === 0 ? (
        <p className="py-2 text-sm text-muted">업로드된 서류가 없습니다.</p>
      ) : (
        <ul className="divide-y divide-border">
          {documents.map((doc) => {
            const isLatest =
              !doc.category || latestByCategory.get(doc.category)?.id === doc.id;
            return (
              <li
                key={doc.id}
                className={`flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between ${
                  isLatest ? "" : "opacity-60"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {/* 폭은 감싸는 쪽에서 정한다 (select 는 w-full) */}
                    <div className="w-36 shrink-0">
                      <CategorySelect
                        value={doc.category}
                        onChange={(category) => setCategory(doc, category)}
                        disabled={busy !== null}
                      />
                    </div>
                    {doc.category && (
                      <span className="shrink-0 text-xs text-muted">
                        v{doc.versionNo}
                        {!isLatest && " (이전 버전)"}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 truncate text-xs text-muted">
                    {doc.originalFileName} · {formatSize(doc.fileSizeBytes)} ·{" "}
                    {doc.uploader.name} ·{" "}
                    {new Date(doc.uploadedAt).toLocaleString("ko-KR")}
                  </div>
                  {doc.reviewNote && (
                    <div className="mt-1 text-xs text-red-600">
                      {doc.reviewNote}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge tone={REVIEW_TONE[doc.reviewStatus]}>
                    {DOCUMENT_REVIEW_LABEL[doc.reviewStatus]}
                  </Badge>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy !== null}
                    onClick={() => void download(doc)}
                  >
                    {busy === `download:${doc.id}` ? "여는 중…" : "보기"}
                  </Button>
                  {isAdmin && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy !== null}
                        onClick={() => review(doc, "OK")}
                      >
                        확인완료
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={busy !== null}
                        onClick={() => review(doc, "SUPPLEMENT_REQUIRED")}
                      >
                        보완요청
                      </Button>
                    </>
                  )}
                  {/* 확인완료된 서류는 에이전트가 지울 수 없다 (서버도 막는다) */}
                  {(isAdmin || doc.reviewStatus !== "OK") && (
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={busy !== null}
                      onClick={() => remove(doc)}
                    >
                      삭제
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 border-t border-border pt-4">
        <div className="mb-2 text-sm font-medium">
          서류 올리기
          <span className="ml-1.5 text-xs font-normal text-muted">
            같은 종류를 다시 올리면 새 버전으로 쌓입니다.
          </span>
        </div>
        <DocumentPicker
          files={picked}
          onChange={setPicked}
          disabled={busy !== null}
        />
        {picked.length > 0 && (
          <Button
            className="mt-3"
            disabled={busy !== null}
            onClick={() => void upload()}
          >
            {busy === "upload" ? "업로드 중…" : `${picked.length}건 업로드`}
          </Button>
        )}
      </div>
    </section>
  );
}
