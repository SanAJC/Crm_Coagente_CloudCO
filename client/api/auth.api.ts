import { api } from "./axios";

export type AuthUser = {
  id: number;
  nombre: string;
  email: string;
  role: number;
  estado: boolean;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  data_user: AuthUser;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
  return data;
}

export async function refreshTokens(refreshToken: string) {
  const { data } = await api.post<{ accessToken: string; refreshToken: string }>("/auth/refresh", {
    refreshToken,
  });
  return data;
}

export async function logout(refreshToken?: string) {
  const { data } = await api.post<{ message: string }>("/auth/logout", { refreshToken });
  return data;
}
