"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Agent, COUNTRY_LABEL, CountryCode } from "@/lib/types";
import { Button, ErrorBox, Field, Modal, inputClass } from "@/components/ui";

interface Props {
  /** 없으면 신규 생성, 있으면 수정 */
  agent?: Agent;
  onClose: () => void;
  onSaved: () => void;
}

export function AgentForm({ agent, onClose, onSaved }: Props) {
  const editing = Boolean(agent);
  const [loginId, setLoginId] = useState(agent?.loginId ?? "");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(agent?.name ?? "");
  const [countryCode, setCountryCode] = useState<CountryCode>(
    agent?.countryCode ?? "UZ",
  );
  const [organization, setOrganization] = useState(agent?.organization ?? "");
  const [phone, setPhone] = useState(agent?.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/agents/${agent!.id}`, {
          name,
          countryCode,
          organization,
          phone: phone || undefined,
          // 비워두면 비밀번호를 바꾸지 않는다
          ...(password ? { password } : {}),
        });
      } else {
        await api.post("/agents", {
          loginId,
          password,
          name,
          countryCode,
          organization,
          phone: phone || undefined,
        });
      }
      onSaved();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "저장에 실패했습니다.",
      );
      setSaving(false);
    }
  }

  return (
    <Modal title={editing ? "에이전트 수정" : "에이전트 계정 생성"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorBox message={error} />}

        <Field label="계정" required hint={editing ? "계정은 변경할 수 없습니다." : "로그인에 사용할 이메일"}>
          <input
            className={inputClass}
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            disabled={editing}
            required
            placeholder="agent@example.com"
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

        <Field label="담당자명" required>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Demo Agent"
          />
        </Field>

        <Field label="국가" required>
          <select
            className={inputClass}
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value as CountryCode)}
          >
            {(Object.keys(COUNTRY_LABEL) as CountryCode[]).map((c) => (
              <option key={c} value={c}>
                {COUNTRY_LABEL[c]} ({c})
              </option>
            ))}
          </select>
        </Field>

        <Field label="기관명" required>
          <input
            className={inputClass}
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            required
            placeholder="Tashkent Partner A"
          />
        </Field>

        <Field label="연락처">
          <input
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998 90 000 0001"
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
