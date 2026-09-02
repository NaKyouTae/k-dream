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
    // 보완요청은 사유가 필수라 별도 모달에서 입력받는다
    if (reviewStatus === "SUPPLEMENT_REQUIRED") {
      setSupplementTarget(doc);
      setSupplementNote(doc.reviewNote ?? "");
      setSupplementError(null);
      return;
    }
    void run(`approve:${doc.id}`, () =>
      api.patch(`/documents/${doc.id}/review`, { reviewStatus }),
    );
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
          파일 선택
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
                <div className="flex flex-wrap items-start gap-3">
                  {/* 종류 — 폭은 감싸는 쪽에서 정한다 (select 는 w-full) */}
                  <div className="relative w-36 shrink-0">
                    <CategorySelect
                      value={doc.category}
                      onChange={(category) => setCategory(doc, category)}
                      disabled={busy !== null}
                    />
                    {busy === `category:${doc.id}` && (
                      // 화살표를 가리지 않도록 왼쪽 안쪽에 겹쳐 놓는다
                      <span className="pointer-events-none absolute inset-y-0 right-7 flex items-center text-muted">
                        <Spinner />
                      </span>
                    )}
                  </div>

                  {/* 파일 정보 — 남는 폭을 모두 쓰고, 넘치면 파일명만 자른다.
                      min-w-0 이 없으면 긴 파일명이 줄 전체를 밀어내며 깨진다 */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="truncate text-sm font-medium">
                        {doc.originalFileName}
                      </span>
                      {doc.category && (
                        <span className="shrink-0 text-xs text-muted">
                          v{doc.versionNo}
                          {!isLatest && " · 이전 버전"}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-muted">
                      {formatSize(doc.fileSizeBytes)} · {doc.uploader.name} ·{" "}
                      {new Date(doc.uploadedAt).toLocaleDateString("ko-KR")}
                    </div>
                    {doc.reviewNote && (
                      <div className="mt-1 text-xs break-words text-red-600">
                        {doc.reviewNote}
                      </div>
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
                    {isAdmin && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={busy === `approve:${doc.id}`}
                          disabled={busy !== null}
                          onClick={() => review(doc, "OK")}
                        >
                          확인
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          loading={busy === `supplement:${doc.id}`}
                          disabled={busy !== null}
                          onClick={() => review(doc, "SUPPLEMENT_REQUIRED")}
                        >
                          보완
                        </Button>
                      </>
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
