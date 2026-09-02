"use client";

import { useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useStaff } from "@/components/app-shell";
import {
  DOCUMENT_CATEGORY_LABEL,
  DOCUMENT_REVIEW_LABEL,
  DocumentCategory,
  DocumentReviewStatus,
  StudentDocument,
} from "@/lib/types";
import {
  Badge,
  Button,
  ErrorBox,
  Modal,
  Spinner,
  inputClass,
} from "@/components/ui";
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
  /** 보완요청 사유를 입력받는 모달의 대상 서류 */
  const [supplementTarget, setSupplementTarget] =
    useState<StudentDocument | null>(null);
  const [supplementNote, setSupplementNote] = useState("");
  const [supplementError, setSupplementError] = useState<string | null>(null);
  /** 헤더의 버튼으로 파일 선택창을 연다 */
  const openPicker = useRef<(() => void) | null>(null);
  /** 종류를 드롭다운으로 바꿔 보여줄 서류 id */
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

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
    setEditingCategory(null);
    if (doc.category === category) return;
    void run(`category:${doc.id}`, () =>
      api.patch(`/documents/${doc.id}/category`, { category }),
    );
  }

  /** 검토 상태를 바꾼다. 되돌리기(NOT_REVIEWED)는 사유도 함께 지워진다. */
  function setReviewStatus(
    doc: StudentDocument,
    reviewStatus: DocumentReviewStatus,
  ) {
    // 버튼마다 자기 작업일 때만 로딩이 돌도록 키를 나눈다
    const key = reviewStatus === "OK" ? "approve" : "revert";
    void run(`${key}:${doc.id}`, () =>
      api.patch(`/documents/${doc.id}/review`, { reviewStatus }),
    );
  }

  function review(doc: StudentDocument, reviewStatus: DocumentReviewStatus) {
    // 보완요청은 사유가 필수라 별도 모달에서 입력받는다
    if (reviewStatus === "SUPPLEMENT_REQUIRED") {
      setSupplementTarget(doc);
      setSupplementNote(doc.reviewNote ?? "");
      setSupplementError(null);
      return;
    }
    setReviewStatus(doc, reviewStatus);
  }

  async function submitSupplement() {
    const doc = supplementTarget;
    const reviewNote = supplementNote.trim();
    if (!doc || !reviewNote) return;

    // 모달이 아래 ErrorBox 를 가리므로 오류를 모달 안에서 보여준다
    setSupplementError(null);
    setBusy(`supplement:${doc.id}`);
    try {
      await api.patch(`/documents/${doc.id}/review`, {
        reviewStatus: "SUPPLEMENT_REQUIRED",
        reviewNote,
      });
      setSupplementTarget(null);
      await onChanged();
    } catch (err) {
      setSupplementError(
        err instanceof ApiError ? err.message : "처리에 실패했습니다.",
      );
    } finally {
      setBusy(null);
    }
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
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-semibold">서류 ({documents.length}건)</h2>
        <Button
          size="sm"
          variant="secondary"
          disabled={busy !== null}
          onClick={() => openPicker.current?.()}
        >
          + 파일 추가
        </Button>
      </div>

      {error && <ErrorBox message={error} />}

      {/* 고른 파일은 버튼 바로 아래에 보여준다 */}
      <div className={picked.length > 0 ? "mb-4" : ""}>
        <DocumentPicker
          files={picked}
          onChange={setPicked}
          disabled={busy !== null}
          showTrigger={false}
          openRef={openPicker}
        />
        {picked.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <Button
              loading={busy === "upload"}
              disabled={busy !== null}
              onClick={() => void upload()}
            >
              {busy === "upload" ? "업로드 중…" : `${picked.length}건 업로드`}
            </Button>
            <span className="text-xs text-muted">
              종류는 비워둬도 되고 올린 뒤에 지정할 수 있습니다.
            </span>
          </div>
        )}
      </div>

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
                className={`py-3 ${isLatest ? "" : "opacity-75"}`}
              >
                {/* 1행 — 종류와 동작. 좁아져도 접히지 않고 한 줄을 유지한다 */}
                <div className="flex items-center gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    {editingCategory === doc.id ? (
                      <div className="w-36 shrink-0">
                        <CategorySelect
                          value={doc.category}
                          autoFocus
                          onChange={(category) => setCategory(doc, category)}
                          onCancel={() => setEditingCategory(null)}
                          disabled={busy !== null}
                        />
                      </div>
                    ) : (
                      <>
                        <span
                          className={`truncate text-sm font-medium ${
                            doc.category ? "" : "text-muted"
                          }`}
                        >
                          {doc.category
                            ? DOCUMENT_CATEGORY_LABEL[doc.category]
                            : "미지정"}
                        </span>
                        {doc.category && (
                          <span className="shrink-0 text-xs text-muted">
                            v{doc.versionNo}
                            {!isLatest && " · 이전 버전"}
                          </span>
                        )}
                        <button
                          type="button"
                          title="서류 종류 변경"
                          aria-label="서류 종류 변경"
                          disabled={busy !== null}
                          onClick={() => setEditingCategory(doc.id)}
                          className="shrink-0 cursor-pointer rounded p-1 text-muted hover:bg-black/[0.04] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy === `category:${doc.id}` ? (
                            <Spinner />
                          ) : (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 16 16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M11.5 2.5a1.6 1.6 0 0 1 2.3 2.3L5.6 13 2.5 13.5l.5-3.1 8.5-7.9Z" />
                            </svg>
                          )}
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge tone={REVIEW_TONE[doc.reviewStatus]}>
                      {DOCUMENT_REVIEW_LABEL[doc.reviewStatus]}
                    </Badge>
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={busy === `download:${doc.id}`}
                      disabled={busy !== null}
                      onClick={() => void download(doc)}
                    >
                      보기
                    </Button>
                    {/* 지금 상태와 다른 것만 보여준다 */}
                    {isAdmin && doc.reviewStatus !== "OK" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={busy === `approve:${doc.id}`}
                        disabled={busy !== null}
                        onClick={() => review(doc, "OK")}
                      >
                        확인
                      </Button>
                    )}
                    {isAdmin && doc.reviewStatus !== "SUPPLEMENT_REQUIRED" && (
                      <Button
                        size="sm"
                        variant="danger"
                        loading={busy === `supplement:${doc.id}`}
                        disabled={busy !== null}
                        onClick={() => review(doc, "SUPPLEMENT_REQUIRED")}
                      >
                        보완
                      </Button>
                    )}
                    {isAdmin && doc.reviewStatus !== "NOT_REVIEWED" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={busy === `revert:${doc.id}`}
                        disabled={busy !== null}
                        onClick={() => setReviewStatus(doc, "NOT_REVIEWED")}
                      >
                        되돌리기
                      </Button>
                    )}
                    {/* 확인완료된 서류는 에이전트가 지울 수 없다 (서버도 막는다) */}
                    {(isAdmin || doc.reviewStatus !== "OK") && (
                      <Button
                        size="sm"
                        variant="danger"
                        loading={busy === `delete:${doc.id}`}
                        disabled={busy !== null}
                        onClick={() => remove(doc)}
                      >
                        삭제
                      </Button>
                    )}
                  </div>
                </div>

                {/* 2행 — 파일 정보. 좌측은 남는 폭을 쓰고 길면 파일명을 자른다 */}
                <div className="mt-1.5 flex items-baseline justify-between gap-3 text-xs text-muted">
                  <span className="min-w-0 truncate">
                    <span className="text-foreground">
                      {doc.originalFileName}
                    </span>
                    {" · "}
                    {formatSize(doc.fileSizeBytes)}
                  </span>
                  <span className="shrink-0">
                    {new Date(doc.uploadedAt).toLocaleDateString("ko-KR")}
                    {" · "}
                    {doc.uploader.name}
                  </span>
                </div>

                {doc.reviewNote && (
                  <div className="mt-1.5 text-xs break-words text-red-600">
                    {doc.reviewNote}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {supplementTarget && (
        <Modal
          title="보완 요청"
          onClose={() => setSupplementTarget(null)}
        >
          <p className="mb-3 text-sm text-muted">
            <span className="font-medium text-foreground">
              {supplementTarget.originalFileName}
            </span>
            <br />
            어떤 점을 보완해야 하는지 적어주세요. 에이전트에게 그대로 보입니다.
          </p>

          {supplementError && <ErrorBox message={supplementError} />}

          <textarea
            className={`${inputClass} min-h-28 resize-y`}
            value={supplementNote}
            autoFocus
            onChange={(e) => setSupplementNote(e.target.value)}
            placeholder="예) 여권 사진면이 잘려 있습니다. 네 모서리가 모두 보이도록 다시 촬영해 주세요."
          />

          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSupplementTarget(null)}
            >
              취소
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={busy === `supplement:${supplementTarget.id}`}
              disabled={busy !== null || !supplementNote.trim()}
              onClick={() => void submitSupplement()}
            >
              보완 요청
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
}
