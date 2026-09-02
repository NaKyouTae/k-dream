"use client";

import { use, useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Badge, Button, ErrorBox } from "@/components/ui";
import {
  DOCUMENT_CATEGORY_LABEL,
  DOCUMENT_REVIEW_LABEL,
  DocumentReviewStatus,
  StudentDocument,
} from "@/lib/types";

const REVIEW_TONE: Record<
  DocumentReviewStatus,
  "success" | "danger" | "neutral"
> = {
  OK: "success",
  SUPPLEMENT_REQUIRED: "danger",
  NOT_REVIEWED: "neutral",
};

/** 검토를 마쳤을 때 목록 창에 알리는 신호 */
export const DOCUMENT_REVIEWED_MESSAGE = "k-dream:document-reviewed";

/**
 * 서류 검토 전용 화면. 목록에서 새 창으로 열린다.
 * 사이드바 없이 문서를 크게 보여주고, 상단 막대에서 바로 검토를 마칠 수 있다.
 */
export default function DocumentReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [document, setDocument] = useState<StudentDocument | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /** 서류 정보와 파일 링크를 함께 받는다. 링크는 만료가 있어 열 때마다 새로 받는다. */
  const fetchDocument = useCallback(
    (documentId: string) =>
      Promise.all([
        api.get<StudentDocument>(`/documents/${documentId}`),
        api.get<{ url: string }>(`/documents/${documentId}/download-url`),
      ]).then(([detail, link]) => {
        setDocument(detail);
        setFileUrl(
          link.url.startsWith("http")
            ? link.url
            : `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:17000"}${link.url}`,
        );
      }),
    [],
  );

  useEffect(() => {
    // 프로미스 콜백 안에서만 setState 한다 (effect 동기 setState 금지)
    fetchDocument(id).catch((err: unknown) => {
      setError(
        err instanceof ApiError ? err.message : "서류를 불러오지 못했습니다.",
      );
    });
  }, [id, fetchDocument]);

  async function complete() {
    setError(null);
    setSaving(true);
    try {
      await api.patch(`/documents/${id}/review`, { reviewStatus: "OK" });
      // 이 창을 연 목록 화면이 다시 읽어가도록 알린다
      window.opener?.postMessage(
        { type: DOCUMENT_REVIEWED_MESSAGE, id },
        window.location.origin,
      );
      window.close();
      // window.close() 는 스크립트로 연 창에서만 동작한다. 직접 주소를
      // 입력해 들어온 경우를 위해 화면 상태도 갱신해 둔다.
      await fetchDocument(id);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "처리에 실패했습니다.",
      );
    } finally {
      setSaving(false);
    }
  }

  const isPdf = document?.mimeType === "application/pdf";

  return (
    <div className="flex h-viewport flex-col bg-background">
      <header className="sticky top-0 z-10 flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold">
              {document?.category
                ? DOCUMENT_CATEGORY_LABEL[document.category]
                : "미지정"}
            </span>
            {document && document.category && (
              <span className="shrink-0 text-xs text-muted">
                v{document.versionNo}
              </span>
            )}
            {document && (
              <Badge tone={REVIEW_TONE[document.reviewStatus]}>
                {DOCUMENT_REVIEW_LABEL[document.reviewStatus]}
              </Badge>
            )}
          </div>
          <div className="truncate text-xs text-muted">
            {document?.originalFileName ?? "불러오는 중…"}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" onClick={() => window.close()}>
            닫기
          </Button>
          <Button
            loading={saving}
            disabled={!document || document.reviewStatus === "OK"}
            onClick={() => void complete()}
          >
            {document?.reviewStatus === "OK" ? "검토 완료됨" : "검토 완료"}
          </Button>
        </div>
      </header>

      {error && (
        <div className="px-4 pt-4">
          <ErrorBox message={error} />
        </div>
      )}

      <main className="min-h-0 flex-1">
        {fileUrl ? (
          isPdf ? (
            <iframe
              src={fileUrl}
              title={document?.originalFileName ?? "서류"}
              className="size-full border-0"
            />
          ) : (
            // 이미지는 창 안에서 스크롤하며 원본 크기로 볼 수 있게 한다
            <div className="h-full overflow-auto p-4">
              {/* 서명 URL 이라 next/image 최적화 대상이 아니다 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fileUrl}
                alt={document?.originalFileName ?? "서류"}
                className="mx-auto max-w-full"
              />
            </div>
          )
        ) : (
          !error && (
            <p className="p-6 text-sm text-muted">서류를 불러오는 중…</p>
          )
        )}
      </main>
    </div>
  );
}
