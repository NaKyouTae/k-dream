"use client";

import { useRef, useState } from "react";
import {
  DOCUMENT_CATEGORY_LABEL,
  DOCUMENT_CATEGORY_ORDER,
  DocumentCategory,
} from "@/lib/types";
import { Button, inputClass } from "@/components/ui";

export interface PickedFile {
  category: DocumentCategory;
  file: File;
}

/** 서버와 같은 제한 — 여기서 먼저 걸러 불필요한 업로드를 막는다 */
export const ACCEPT = ".pdf,.jpg,.jpeg,.png,.heic,.webp";
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))}KB`
    : `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

/**
 * 서류 종류를 고르고 파일을 담아두는 컴포넌트.
 * 학생 등록 폼에서는 저장 후에 한꺼번에 올리고, 상세에서는 고르는 즉시 올린다.
 */
export function DocumentPicker({
  files,
  onChange,
  disabled,
}: {
  files: PickedFile[];
  onChange: (next: PickedFile[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<DocumentCategory>("PASSPORT");
  const [error, setError] = useState<string | null>(null);

  function addFile(file: File) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`${file.name} — 10MB 를 넘는 파일은 올릴 수 없습니다.`);
      return;
    }
    if (file.size === 0) {
      setError(`${file.name} — 빈 파일입니다.`);
      return;
    }
    setError(null);
    // 같은 종류를 다시 고르면 마지막 것만 남긴다
    onChange([...files.filter((f) => f.category !== category), { category, file }]);
  }

  return (
    <div>
      <div className="flex gap-2">
        <select
          className={`${inputClass} sm:max-w-44`}
          value={category}
          onChange={(e) => setCategory(e.target.value as DocumentCategory)}
          disabled={disabled}
        >
          {DOCUMENT_CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {DOCUMENT_CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="secondary"
          className="shrink-0"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          파일 선택
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) addFile(file);
            // 같은 파일을 다시 골라도 change 가 나도록 비운다
            e.target.value = "";
          }}
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((f) => (
            <li
              key={f.category}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <span className="shrink-0 font-medium">
                {DOCUMENT_CATEGORY_LABEL[f.category]}
              </span>
              <span className="min-w-0 flex-1 truncate text-muted">
                {f.file.name}
              </span>
              <span className="shrink-0 text-xs text-muted">
                {formatSize(f.file.size)}
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  onChange(files.filter((x) => x.category !== f.category))
                }
                aria-label={`${DOCUMENT_CATEGORY_LABEL[f.category]} 삭제`}
                className="shrink-0 cursor-pointer px-1 text-muted hover:text-red-600 disabled:opacity-50"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
