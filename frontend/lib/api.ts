const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

export function requestOtp(email: string) {
  return apiFetch("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function verifyOtp(email: string, code: string) {
  return apiFetch("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export function createConnection(payload: {
  nickname: string;
  engine_type: "postgresql" | "mysql";
  host: string;
  port: number;
  database_name: string;
  username: string;
  password: string;
}) {
  return apiFetch("/connections/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listConnections() {
  return apiFetch("/connections/", { method: "GET" });
}

export function askQuestion(connectionId: number, question: string, history: { question: string; sql: string }[] = []) {
  return apiFetch("/query/ask", {
    method: "POST",
    body: JSON.stringify({ connection_id: connectionId, question, history }),
  });
}

export function generateSql(connectionId: number, question: string, history: { question: string; sql: string }[] = []) {
  return apiFetch("/query/generate", {
    method: "POST",
    body: JSON.stringify({ connection_id: connectionId, question, history }),
  });
}

export function executeSql(connectionId: number, sql: string, question?: string) {
  return apiFetch("/query/execute", {
    method: "POST",
    body: JSON.stringify({ connection_id: connectionId, sql, question }),
  });
}
export function explainSql(sql: string) {
  return apiFetch("/query/explain", {
    method: "POST",
    body: JSON.stringify({ sql }),
  });
}

export function estimateQuery(connectionId: number, sql: string) {
  return apiFetch("/query/estimate", {
    method: "POST",
    body: JSON.stringify({ connection_id: connectionId, sql }),
  });
}

export function getHistory(connectionId: number) {
  return apiFetch(`/query/history/${connectionId}`, {
    method: "GET",
  });
}
