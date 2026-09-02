const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:17000";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // FormData 일 때는 Content-Type 을 직접 넣으면 안 된다 (boundary 가 빠진다)
  const isFormData = init?.body instanceof FormData;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    if (res.status === 401) handleSessionExpired(path);
    throw new ApiError(body?.message ?? res.statusText, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/**
 * 세션이 끊기면(쿠키 만료·다른 곳에서 로그아웃) 화면이 멈추지 않도록
 * 곧바로 로그인 화면으로 보낸다.
 *
 * 저장해 둔 계정 정보는 여기서 지우지 않는다 — 다시 로그인할 때 쓰라고 저장한
 * 값이므로, 삭제는 사용자가 직접 로그아웃할 때만 한다.
 * 로그인 실패(401)는 그 화면에서 메시지로 보여줘야 하므로 제외한다.
 */
function handleSessionExpired(path: string) {
  if (typeof window === "undefined") return;
  if (path.startsWith("/auth/login")) return;
  if (window.location.pathname === "/login") return;
  window.location.href = "/login";
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, form: FormData) =>
    request<T>(path, { method: "POST", body: form }),
};
