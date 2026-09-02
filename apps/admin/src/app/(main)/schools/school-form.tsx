"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import {
  School,
  SCHOOL_STATUS_LABEL,
  SCHOOL_TYPE_LABEL,
  SchoolStatus,
  SchoolType,
} from "@/lib/types";
import { Button, ErrorBox, Field, Modal, inputClass } from "@/components/ui";

interface Props {
  school?: School;
  onClose: () => void;
  onSaved: () => void;
}

export function SchoolForm({ school, onClose, onSaved }: Props) {
  const editing = Boolean(school);
  const [nameKo, setNameKo] = useState(school?.nameKo ?? "");
  const [nameEn, setNameEn] = useState(school?.nameEn ?? "");
  const [type, setType] = useState<SchoolType>(school?.type ?? "UNIVERSITY");
  const [region, setRegion] = useState(school?.region ?? "");
  const [website, setWebsite] = useState(school?.website ?? "");
  const [memo, setMemo] = useState(school?.memo ?? "");
  const [status, setStatus] = useState<SchoolStatus>(school?.status ?? "ACTIVE");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const body = {
      nameKo,
      nameEn: nameEn || undefined,
      type,
      region: region || undefined,
      website: website || undefined,
      memo: memo || undefined,
      status,
    };
    try {
      if (editing) await api.patch(`/schools/${school!.id}`, body);
      else await api.post("/schools", body);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "저장에 실패했습니다.");
      setSaving(false);
    }
  }

  return (
    <Modal title={editing ? "학교 수정" : "학교 등록"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorBox message={error} />}

        <Field label="학교명 (한국어)" required>
          <input
            className={inputClass}
            value={nameKo}
            onChange={(e) => setNameKo(e.target.value)}
            required
            placeholder="부산과학기술대학교"
          />
        </Field>

        <Field label="학교명 (영문)">
          <input
            className={inputClass}
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="Busan Institute of Science and Technology"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="과정 구분" required>
            <select
              className={inputClass}
              value={type}
              onChange={(e) => setType(e.target.value as SchoolType)}
            >
              {(Object.keys(SCHOOL_TYPE_LABEL) as SchoolType[]).map((t) => (
                <option key={t} value={t}>
                  {SCHOOL_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="상태">
            <select
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value as SchoolStatus)}
            >
              {(Object.keys(SCHOOL_STATUS_LABEL) as SchoolStatus[]).map((s) => (
                <option key={s} value={s}>
                  {SCHOOL_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="지역">
          <input
            className={inputClass}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="부산광역시"
          />
        </Field>

        <Field label="홈페이지">
          <input
            className={inputClass}
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://"
          />
        </Field>

        <Field label="메모">
          <textarea
            className={`${inputClass} min-h-20`}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="모집 시기, 담당자 등"
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "저장 중…" : editing ? "저장" : "등록"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
