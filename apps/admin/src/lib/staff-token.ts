import { Me } from "./types";

/**
 * JWT payload 를 서명 검증 없이 읽는다.
 * 권한의 최종 판단은 API 서버가 하고, 여기서는 첫 렌더에 역할을 알기 위한 용도로만 쓴다.
 * (Next 문서의 optimistic check)
 */
export function readStaffFromToken(token: string | undefined): Me | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = Buffer.from(
      payload.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf8");
    const parsed = JSON.parse(json) as Partial<Me>;
    if (!parsed.sub || !parsed.type) return null;
    return {
      sub: parsed.sub,
      loginId: parsed.loginId ?? "",
      name: parsed.name ?? "",
      type: parsed.type,
    };
  } catch {
    return null;
  }
}
