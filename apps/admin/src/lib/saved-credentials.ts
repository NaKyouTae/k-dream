const STORAGE_KEY = "kdream-admin-credentials";

export interface SavedCredentials {
  loginId: string;
  password: string;
}

/**
 * 로그인 편의를 위해 브라우저 localStorage에 계정 정보를 그대로 보관한다.
 * 공용 PC에서는 체크하지 않는 것을 전제로 한 MVP 기능이다.
 */
export function loadCredentials(): SavedCredentials | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedCredentials>;
    if (typeof parsed.loginId !== "string") return null;
    return {
      loginId: parsed.loginId,
      password: typeof parsed.password === "string" ? parsed.password : "",
    };
  } catch {
    return null;
  }
}

export function saveCredentials(credentials: SavedCredentials): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
}

export function clearCredentials(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
