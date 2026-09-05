import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const api = axios.create({ baseURL, withCredentials: true });

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<void> | null = null;

async function refreshSession(): Promise<void> {
  await axios.post(`${baseURL}/auth/refresh`, null, { withCredentials: true });
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const isAuthRoute =
      original?.url?.includes("/auth/login") ||
      original?.url?.includes("/auth/refresh") ||
      original?.url?.includes("/auth/me");

    if (error.response?.status !== 401 || !original || original._retry || isAuthRoute) {
      throw error;
    }

    original._retry = true;

    try {
      refreshPromise ??= refreshSession().finally(() => {
        refreshPromise = null;
      });
      await refreshPromise;
      return api(original);
    } catch (refreshError) {
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw refreshError;
    }
  },
);
