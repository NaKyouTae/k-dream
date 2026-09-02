"use client";

import { MutableRefObject, useEffect, useRef, useState } from "react";
import {
  DOCUMENT_CATEGORY_LABEL,
  DOCUMENT_CATEGORY_ORDER,
  DocumentCategory,
} from "@/lib/types";
import { Button, inputClass } from "@/components/ui";

export interface PickedFile {
  /** 목록에서 각 줄을 구분하기 위한 임시 키 (서버에 보내지 않는다) */
  key: string;
  file: File;
  /** 비워둘 수 있다. 나중에 상세 화면에서도 지정할 수 있다. */
  category: DocumentCategory | null;
}

export const ACCEPT = ".pdf,.jpg,.jpeg,.png,.heic,.webp";

/** 서버와 버킷이 거부하는 크기. 업로드 직전(압축 후) 기준이다. */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * 압축 전 원본 이미지 허용치.
 * 요즘 폰 사진은 장당 10MB 를 넘기도 하는데, 여기서 미리 막으면
 * 압축해서 올릴 수 있는 파일까지 거부하게 된다. 실제 판정은 압축 후에 한다.
 */
export const MAX_SOURCE_IMAGE_BYTES = 40 * 1024 * 1024;

export function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))}KB`
    : `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

/**
 * 미지정을 포함한 종류 선택 드롭다운.
 *
 * 폭은 감싸는 쪽에서 정한다. inputClass 가 w-full 이라 여기에 w-32 같은 걸
 * 덧붙이면 충돌해서 레이아웃이 깨진다 (tailwind-merge 를 쓰지 않는다).
 */
export function CategorySelect({
  value,
  onChange,
  onCancel,
  disabled,
  autoFocus,
}: {
  value: DocumentCategory | null;
  onChange: (next: DocumentCategory | null) => void;
  /** 고르지 않고 빠져나갈 때 (포커스 이탈·Esc) */
  onCancel?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <select
      className={inputClass}
      value={value ?? ""}
      disabled={disabled}
      autoFocus={autoFocus}
      // Safari 는 옵션을 고를 때 change 보다 blur 가 먼저 나기도 한다.
      // 즉시 닫으면 선택이 유실되므로 한 틱 미뤄서, 그 사이 change 가
      // 처리됐다면 이 취소는 아무 일도 하지 않게 한다.
      onBlur={() => setTimeout(() => onCancel?.(), 0)}
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel?.();
      }}
      onChange={(e) =>
        onChange(e.target.value ? (e.target.value as DocumentCategory) : null)
      }
    >
      <option value="">미지정</option>
      {DOCUMENT_CATEGORY_ORDER.map((c) => (
        <option key={c} value={c}>
          {DOCUMENT_CATEGORY_LABEL[c]}
        </option>
      ))}
    </select>
  );
}

/**
 * 파일을 먼저 여러 개 고르고, 그 다음 각각의 종류를 지정한다.
 * 종류는 선택 사항이라 비워둔 채 올려도 되고, 나중에 상세 화면에서 지정할 수 있다.
 */
export function DocumentPicker({
  files,
  onChange,
  disabled,
  showTrigger = true,
  openRef,
}: {
  files: PickedFile[];
  onChange: (next: PickedFile[]) => void;
  disabled?: boolean;
  /** 파일 선택 버튼을 다른 곳(섹션 헤더 등)에 두고 싶으면 false */
  showTrigger?: boolean;
  /** 바깥에서 파일 선택창을 열 수 있게 여는 함수를 담아준다 */
  openRef?: MutableRefObject<(() => void) | null>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // 헤더 등 바깥 버튼에서도 파일 선택창을 열 수 있게 한다
  useEffect(() => {
    if (!openRef) return;
    openRef.current = () => inputRef.current?.click();
    return () => {
      openRef.current = null;
    };
  }, [openRef]);

  function addFiles(selected: FileList) {
    const rejected: string[] = [];
    const accepted: PickedFile[] = [];

    for (const file of Array.from(selected)) {
      // PDF 는 압축하지 않으므로 지금 판정하고, 이미지는 압축 후에 판정한다
      const isImage = file.type.startsWith("image/");
      const limit = isImage ? MAX_SOURCE_IMAGE_BYTES : MAX_FILE_SIZE_BYTES;
      if (file.size > limit) {
        rejected.push(`${file.name} — ${isImage ? "40MB" : "10MB"} 초과`);
        continue;
      }
      if (file.size === 0) {
        rejected.push(`${file.name} — 빈 파일`);
        continue;
      }
      // 같은 파일을 두 번 고르면 한 번만 담는다
      const duplicate = files.some(
        (f) => f.file.name === file.name && f.file.size === file.size,
      );
      if (duplicate) continue;

      accepted.push({
        key: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        category: null,
      });
    }

    setErrors(rejected);
    if (accepted.length) onChange([...files, ...accepted]);
  }

  function update(key: string, category: DocumentCategory | null) {
    onChange(files.map((f) => (f.key === key ? { ...f, category } : f)));
  }

  return (
    <div>
      {showTrigger && (
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          + 파일 추가
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          // 같은 파일을 다시 골라도 change 가 나도록 비운다
          e.target.value = "";
        }}
      />

      {errors.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {errors.map((message) => (
            <li key={message} className="text-sm text-red-600">
              {message}
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul className={`space-y-2 ${showTrigger ? "mt-3" : ""}`}>
          {files.map((f) => (
            <li
              key={f.key}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm">{f.file.name}</div>
                <div className="text-xs text-muted">
                  {formatSize(f.file.size)}
                </div>
              </div>
              {/* 폭은 여기서 정한다 (select 는 w-full 로 이 안을 채운다) */}
              <div className="w-36 shrink-0">
                <CategorySelect
                  value={f.category}
                  onChange={(category) => update(f.key, category)}
                  disabled={disabled}
                />
              </div>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(files.filter((x) => x.key !== f.key))}
                aria-label={`${f.file.name} 제외`}
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
