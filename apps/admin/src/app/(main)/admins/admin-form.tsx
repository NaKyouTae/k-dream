"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Staff } from "@/lib/types";
import { Button, ErrorBox, Field, Modal, inputClass } from "@/components/ui";

interface Props {
  /** 없으면 신규 생성, 있으면 수정 */
  admin?: Staff;
  onClose: () => void;
  onSaved: () => void;
}

export function AdminForm({ admin, onClose, onSaved }: Props) {
  const editing = Boolean(admin);
  const [loginId, setLoginId] = useState(admin?.loginId ?? "");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(admin?.name ?? "");
  const [phone, setPhone] = useState(admin?.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/admins/${admin!.id}`, {
          name,
          phone: phone || undefined,
          // 비워두면 비밀번호를 바꾸지 않는다
          ...(password ? { password } : {}),
        });
      } else {
        await api.post("/admins", {
          loginId,
          password,
          name,
          phone: phone || undefined,
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "저장에 실패했습니다.");
      setSaving(false);
    }
  }

  return (
    <Modal title={editing ? "관리자 수정" : "관리자 계정 생성"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorBox message={error} />}

        <Field
          label="계정"
          required
          hint={editing ? "계정은 변경할 수 없습니다." : "로그인에 사용할 계정"}
        >
          <input
            className={inputClass}
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            disabled={editing}
            required
            placeholder="staff@k-dream.kr"
          />
        </Field>

        <Field
          label="비밀번호"
          required={!editing}
          hint={editing ? "변경할 때만 입력하세요. (8자 이상)" : "8자 이상"}
        >
          <input
            className={inputClass}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!editing}
            minLength={8}
            placeholder="••••••••"
          />
        </Field>

        <Field label="이름" required>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="홍길동"
          />
        </Field>

        <Field label="연락처">
          <input
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-0000-0000"
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "저장 중…" : editing ? "저장" : "계정 생성"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
