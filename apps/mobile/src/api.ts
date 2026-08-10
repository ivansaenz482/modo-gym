import Constants from "expo-constants";
import { Platform } from "react-native";

const getApiUrl = () => {
  const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
  if (extra?.apiUrl) return extra.apiUrl;
  if (Platform.OS === "android") return "http://10.0.2.2:3000";
  return "http://localhost:3000";
};

const API_URL = getApiUrl();
const TOKEN_KEY = "modo-gym-token";

let token: string | null = null;

export function setToken(t: string | null) {
  token = t;
}

export function getToken() {
  return token;
}

export function apiUrl() {
  return API_URL;
}

async function request<T = any>(
  path: string,
  { method = "GET", body, auth = true }: { method?: string; body?: any; auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || `Error ${res.status}`);
  }
  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; user: any }>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    }),
  register: (email: string, password: string, name: string, phone?: string) =>
    request<{ accessToken: string; user: any }>("/auth/register", {
      method: "POST",
      body: { email, password, name, phone },
      auth: false,
    }),
  me: () => request("/auth/me"),
  updateProfile: (id: string, body: any) => request(`/clients/${id}`, { method: "PATCH", body }),
  generateRoutine: (body: any) => request("/ai/routine", { method: "POST", body }),
  generateNutrition: () => request("/ai/nutrition", { method: "POST" }),
  myRoutines: () => request("/routines/mine"),
  createRoutine: (body: any) => request("/routines", { method: "POST", body }),
  exercises: () => request("/exercises"),
  myProgress: () => request("/progress/mine"),
  createProgress: (body: any) => request("/progress", { method: "POST", body }),
  myNutrition: () => request("/nutrition/mine"),
};
