import { api } from "./axios";

export type AuthUser = {
  id: number;
  nombre: string;
  email: string;
  role: number;
  estado: boolean;
};

export async function login(email: string, password: string): Promise<AuthUser> {
  const { data } = await api.post<{ data_user: AuthUser }>("/auth/login", { email, password });
  return data.data_user;
}

export async function me(): Promise<AuthUser> {
  const { data } = await api.get<{ data_user: AuthUser }>("/auth/me");
  return data.data_user;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
