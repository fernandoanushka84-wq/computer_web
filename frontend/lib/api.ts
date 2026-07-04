export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export type ApiResponse<T> = T;

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("cartCount");
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers ?? {});
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", headers.get("Content-Type") || "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data: unknown = parseResponseText(text);

  if (!response.ok) {
    const payload = typeof data === "object" && data !== null ? data as Record<string, unknown> : {};
    const errorMessage = (payload.detail as string | undefined) || (payload.message as string | undefined) || response.statusText || "Request failed";
    throw new Error(errorMessage);
  }

  return data;

  function parseResponseText(value: string): unknown {
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return value;
    }
  }
}
