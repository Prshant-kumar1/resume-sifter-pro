export const API_BASE_URL = "https://resumesift-backend.onrender.com/api/v1";

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, headers, ...rest } = options;
  let url = `${API_BASE_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) qs.append(k, String(v));
    });
    const s = qs.toString();
    if (s) url += `?${s}`;
  }
  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  // Some endpoints might return empty
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json() as Promise<T>;
  return (await res.text()) as unknown as T;
}

export const api = {
  get: <T>(path: string, options?: FetchOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    request<T>(path, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    request<T>(path, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string, options?: FetchOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

// ---------- Types ----------
export type ScreeningResult = {
  id?: string | number;
  candidate_name?: string;
  result?: "Match" | "No Match" | string;
  probability?: number;
  confidence?: number;
  job_role?: string;
  job_title?: string;
  date?: string;
  created_at?: string;
  matched_skills?: string[];
  missing_skills?: string[];
  recommendation?: string;
  score?: number;
};

export type JobDescription = {
  id: string | number;
  title: string;
  department?: string;
  description?: string;
  created_at?: string;
  candidates_screened?: number;
};
