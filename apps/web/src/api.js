const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TOKEN_KEY = "modo-gym-token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function authHeaders(extra = {}) {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && getToken()) {
    headers.Authorization = `Bearer ${getToken()}`;
  }
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || data.error || `Error ${res.status}`);
    err.status = res.status;
    err.details = data;
    throw err;
  }

  return data;
}

export const api = {
  login: (body) => request("/auth/login", { method: "POST", body, auth: false }),
  register: (body) => request("/auth/register", { method: "POST", body, auth: false }),
  me: () => request("/auth/me"),
  getClients: () => request("/clients"),
  getClient: (id) => request(`/clients/${id}`),
  getExercises: () => request("/exercises"),
  createExercise: (body) => request("/exercises", { method: "POST", body }),
  updateExercise: (id, body) => request(`/exercises/${id}`, { method: "PATCH", body }),
  uploadFile: (file) => upload("/upload", file),
  getQr: () => request("/qr"),
};

export function mediaUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path}`;
}

async function upload(path, file) {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || data.error || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}
