"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import {
  COUNTRY_LABEL,
  GENDER_LABEL,
  PROGRAM_LABEL,
  SCHOOL_TYPE_LABEL,
  STUDENT_STATUS_LABEL,
  STUDENT_STATUS_TONE,
  StudentDetail,
  StudentStatus,
} from "@/lib/types";
import { Badge, Button, ErrorBox, LinkButton, inputClass } from "@/components/ui";
import { useStaff } from "@/components/app-shell";
import { StudentForm } from "../student-form";
import { DocumentsSection } from "./documents-section";

/** 관리자가 직접 지정할 수 있는 상태. 검토요청은 등록 시점에만 붙는다. */
const REVIEW_ACTIONS: { status: StudentStatus; label: string }[] = [
  { status: "REVIEWING", label: "검토중으로 변경" },
  { status: "SUPPLEMENT_REQUIRED", label: "서류보완 요청" },
  { status: "REVIEW_COMPLETED", label: "검토완료" },
];

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const me = useStaff();
  const isAdmin = me?.type === "ADMIN";
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<StudentStatus | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 첫 await 이전에 setState 를 호출하지 않는다 (effect 내 동기 setState 금지)
  const load = useCallback(async (studentId: string) => {
    try {
      const res = await api.get<StudentDetail>(`/students/${studentId}`);
      setStudent(res);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "학생 정보를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 프로미스 콜백 안에서만 setState 한다 (effect 동기 setState 금지)
    void Promise.resolve().then(() => load(id));
  }, [load, id]);

  async function changeStatus(status: StudentStatus) {
    setError(null);
    setSaving(status);
    try {
      await api.patch(`/students/${id}/status`, {
        status,
        reviewNote: note.trim() || undefined,
      });
      setNote("");
      await load(id);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "상태 변경에 실패했습니다.",
      );
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }
  if (!student) {
    return (
      <div>
        {error && <ErrorBox message={error} />}
        <LinkButton href="/students" size="sm">
          ← 학생 목록
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <LinkButton href="/students" size="sm">
        ← 학생 목록
      </LinkButton>

      <div className="mt-3 mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold sm:text-xl">{student.passportName}</h1>
          <p className="mt-0.5 text-sm text-muted">
            {student.studentNo} · {COUNTRY_LABEL[student.countryCode]}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={STUDENT_STATUS_TONE[student.status]}>
            {STUDENT_STATUS_LABEL[student.status]}
          </Badge>
          {/* 검토완료되면 에이전트는 더 수정할 수 없다 (서버도 막는다) */}
          {!isAdmin && student.status !== "REVIEW_COMPLETED" && (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              정보 수정
            </Button>
          )}
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      {student.reviewNote && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-xs font-medium text-amber-800">
            에이전트에게 전달된 메모
          </div>
          <p className="mt-1 text-sm text-amber-900">{student.reviewNote}</p>
        </div>
      )}

      <Section title="기본 정보">
        <Row label="여권 영문명" value={student.passportName} />
        <Row label="현지어 이름" value={student.localName} />
        <Row
          label="생년월일"
          value={new Date(student.birthDate).toLocaleDateString("ko-KR")}
        />
        <Row label="성별" value={GENDER_LABEL[student.genderCode]} />
        <Row label="여권번호" value={student.passportNo} />
        <Row
          label="여권 만료"
          value={new Date(student.passportExpiry).toLocaleDateString("ko-KR")}
        />
        <Row label="연락처" value={student.phone} />
        <Row label="이메일" value={student.email} />
      </Section>

      <Section title="지원 정보">
        <Row label="희망 과정" value={PROGRAM_LABEL[student.desiredProgram]} />
        <Row label="희망 전공" value={student.desiredMajor} />
        <Row
          label="신청 학교"
          value={
            student.school
              ? `${student.school.nameKo} (${SCHOOL_TYPE_LABEL[student.school.type]})`
              : null
          }
        />
        <Row
          label="담당 에이전트"
          value={`${student.agent.name}${
            student.agent.organization ? ` · ${student.agent.organization}` : ""
          }`}
        />
        <Row
          label="최근 검토"
          value={
            student.reviewedAt
              ? `${new Date(student.reviewedAt).toLocaleString("ko-KR")}${
                  student.reviewedBy ? ` · ${student.reviewedBy.name}` : ""
                }`
              : null
          }
        />
      </Section>

      <DocumentsSection
        studentId={student.id}
        documents={student.documents}
        onChanged={() => load(id)}
      />

      {/* 검토 처리는 관리자만. 서버도 AdminGuard 로 막는다 */}
      {isAdmin && (
      <Section title="검토 처리">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">
            메모
            <span className="ml-1.5 text-xs font-normal text-muted">
              서류보완 요청 시 필수. 에이전트에게 그대로 보입니다.
            </span>
          </span>
          <textarea
            className={`${inputClass} min-h-20`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="예) 성적증명서 스캔 상태가 좋지 않아 재업로드가 필요합니다."
          />
        </label>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {REVIEW_ACTIONS.filter((a) => a.status !== student.status).map(
            (action) => (
              <Button
                key={action.status}
                variant={
                  action.status === "REVIEW_COMPLETED" ? "primary" : "secondary"
                }
                disabled={saving !== null}
                onClick={() => void changeStatus(action.status)}
              >
                {saving === action.status ? "처리 중…" : action.label}
              </Button>
            ),
          )}
        </div>
      </Section>
      )}

      {editing && (
        <StudentForm
          student={student}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            void load(id);
          }}
        />
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4 rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <h2 className="mb-3 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-3 py-1.5 text-sm">
      <dt className="w-28 shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 break-words">{value || "-"}</dd>
    </div>
  );
}
