"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import {
  Agent,
  COUNTRY_LABEL,
  Cursor,
  GENDER_LABEL,
  GenderCode,
  PROGRAM_LABEL,
  ProgramCode,
  School,
  StudentDetail,
} from "@/lib/types";
import { useStaff } from "@/components/app-shell";
import { Button, ErrorBox, Field, Modal, inputClass } from "@/components/ui";
import {
  DocumentPicker,
  MAX_FILE_SIZE_BYTES,
  PickedFile,
} from "@/components/document-picker";
import { compressImage } from "@/lib/image-compress";

interface Props {
  /** 없으면 신규 등록, 있으면 수정 */
  student?: StudentDetail;
  onClose: () => void;
  onSaved: () => void;
}

/** yyyy-MM-dd (date input 이 요구하는 형식) */
function toDateInput(value?: string) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export function StudentForm({ student, onClose, onSaved }: Props) {
  const me = useStaff();
  const isAdmin = me?.type === "ADMIN";
  const editing = Boolean(student);

  const [schools, setSchools] = useState<School[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentId, setAgentId] = useState(student?.agent?.id ?? "");
  const [passportName, setPassportName] = useState(student?.passportName ?? "");
  const [birthDate, setBirthDate] = useState(toDateInput(student?.birthDate));
  const [genderCode, setGenderCode] = useState<GenderCode>(
    student?.genderCode ?? "M",
  );
  const [passportNo, setPassportNo] = useState(student?.passportNo ?? "");
  const [passportExpiry, setPassportExpiry] = useState(
    toDateInput(student?.passportExpiry),
  );
  const [phone, setPhone] = useState(student?.phone ?? "");
  const [email, setEmail] = useState(student?.email ?? "");
  const [desiredProgram, setDesiredProgram] = useState<ProgramCode>(
    student?.desiredProgram ?? "BACH",
  );
  const [desiredMajor, setDesiredMajor] = useState(student?.desiredMajor ?? "");
  const [schoolId, setSchoolId] = useState(student?.school?.id ?? "");
  const [documents, setDocuments] = useState<PickedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  // 신청 가능한(운영중) 학교만 고를 수 있다
  const loadOptions = useCallback(async (admin: boolean, needAgents: boolean) => {
    try {
      const res = await api.get<Cursor<School>>("/schools?status=ACTIVE&limit=100");
      setSchools(res.items);
    } catch {
      // 학교를 못 불러와도 등록 자체는 가능하다 (학교는 선택 항목)
    }
    // 관리자는 담당 에이전트를 직접 골라야 한다 (에이전트 목록은 관리자 전용 API)
    if (!admin || !needAgents) return;
    try {
      const res = await api.get<Cursor<Agent>>("/agents?status=ACTIVE&limit=100");
      setAgents(res.items);
    } catch {
      // 목록을 못 불러오면 저장 시 서버가 알려준다
    }
  }, []);

  useEffect(() => {
    // 프로미스 콜백 안에서만 setState 한다 (effect 동기 setState 금지)
    void Promise.resolve().then(() => loadOptions(isAdmin, !editing));
  }, [loadOptions, isAdmin, editing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const body = {
      // 수정 시에는 담당 에이전트를 바꾸지 않는다 (서버도 무시한다)
      ...(editing || !isAdmin ? {} : { agentId }),
      passportName: passportName.trim(),
      birthDate,
      genderCode,
      passportNo: passportNo.trim(),
      passportExpiry,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      desiredProgram,
      desiredMajor: desiredMajor.trim() || undefined,
      schoolId: schoolId || undefined,
    };
    try {
      if (editing) {
        await api.patch(`/students/${student!.id}`, body);
        onSaved();
        return;
      }

      // 학생이 있어야 서류를 붙일 수 있으므로 등록 → 업로드 순서로 진행한다
      const created = await api.post<{ id: string }>("/students", body);
      for (const [i, doc] of documents.entries()) {
        setProgress(`서류 업로드 중… (${i + 1}/${documents.length})`);
        const file = await compressImage(doc.file);
        if (file.size > MAX_FILE_SIZE_BYTES) {
          throw new ApiError(
            `${doc.file.name} — 압축 후에도 10MB 를 넘어 올릴 수 없습니다.`,
            400,
          );
        }
        const form = new FormData();
        if (doc.category) form.append("category", doc.category);
        form.append("file", file);
        await api.upload(`/students/${created.id}/documents`, form);
      }
      onSaved();
    } catch (err) {
      // 학생은 이미 만들어졌을 수 있으므로 그 사실을 알려준다
      const message =
        err instanceof ApiError ? err.message : "저장에 실패했습니다.";
      setError(
        progress
          ? `학생은 등록됐지만 서류 업로드에 실패했습니다: ${message} 상세 화면에서 다시 올려주세요.`
          : message,
      );
      setProgress(null);
      setSaving(false);
    }
  }

  return (
    <Modal title={editing ? "학생 정보 수정" : "학생 등록"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorBox message={error} />}

        {!editing && isAdmin && (
          <Field
            label="담당 에이전트"
            required
            hint="선택한 에이전트의 국가로 학생번호가 발급됩니다."
          >
            <select
              className={inputClass}
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              required
            >
              <option value="">선택하세요</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {COUNTRY_LABEL[a.countryCode]}
                  {a.organization ? ` · ${a.organization}` : ""}
                </option>
              ))}
            </select>
          </Field>
        )}

        {!editing && !isAdmin && me?.countryCode && (
          <p className="rounded-lg bg-black/[0.03] px-3 py-2 text-xs text-muted">
            국가는 계정 기준 <b>{COUNTRY_LABEL[me.countryCode]}</b>로 등록되며,
            학생번호는 저장할 때 자동으로 발급됩니다.
          </p>
        )}

        <Field label="여권 영문명" required hint="여권 표기 그대로 입력하세요.">
          <input
            className={inputClass}
            value={passportName}
            onChange={(e) => setPassportName(e.target.value.toUpperCase())}
            required
            placeholder="ABDULLAEV AKMAL"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="생년월일" required>
            <input
              className={inputClass}
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </Field>

          <Field label="성별" required>
            <select
              className={inputClass}
              value={genderCode}
              onChange={(e) => setGenderCode(e.target.value as GenderCode)}
            >
              {(Object.keys(GENDER_LABEL) as GenderCode[]).map((g) => (
                <option key={g} value={g}>
                  {GENDER_LABEL[g]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="여권번호" required>
            <input
              className={inputClass}
              value={passportNo}
              onChange={(e) => setPassportNo(e.target.value.toUpperCase())}
              required
              placeholder="AA1234567"
            />
          </Field>

          <Field label="여권 만료일" required>
            <input
              className={inputClass}
              type="date"
              value={passportExpiry}
              onChange={(e) => setPassportExpiry(e.target.value)}
              required
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="연락처">
            <input
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 000 0001"
            />
          </Field>

          <Field label="이메일">
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="희망 과정" required>
            <select
              className={inputClass}
              value={desiredProgram}
              onChange={(e) => setDesiredProgram(e.target.value as ProgramCode)}
            >
              {(Object.keys(PROGRAM_LABEL) as ProgramCode[]).map((p) => (
                <option key={p} value={p}>
                  {PROGRAM_LABEL[p]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="희망 전공">
            <input
              className={inputClass}
              value={desiredMajor}
              onChange={(e) => setDesiredMajor(e.target.value)}
              placeholder="경영학"
            />
          </Field>
        </div>

        <Field label="신청 학교" hint="나중에 정해도 됩니다.">
          <select
            className={inputClass}
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
          >
            <option value="">선택 안 함</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameKo}
                {s.region ? ` · ${s.region}` : ""}
              </option>
            ))}
          </select>
        </Field>

        {/* 서류는 학생이 만들어진 뒤에 올라가므로 등록일 때만 받는다 */}
        {!editing && (
          <Field
            label="서류"
            hint="여러 개를 한 번에 고를 수 있습니다. 종류는 비워둬도 되고, 나중에 상세 화면에서 지정할 수 있습니다. PDF 또는 이미지, 각 10MB 이하."
          >
            <div className="mt-1.5">
              <DocumentPicker
                files={documents}
                onChange={setDocuments}
                disabled={saving}
              />
            </div>
          </Field>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          {progress && (
            <span className="mr-auto text-sm text-muted">{progress}</span>
          )}
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
