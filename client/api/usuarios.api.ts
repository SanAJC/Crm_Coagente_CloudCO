import { api } from "./axios";

export type UsuarioAsignable = {
  id: number;
  nombre: string;
};

export async function listAsignables(): Promise<UsuarioAsignable[]> {
  const { data } = await api.get<UsuarioAsignable[]>("/usuarios/asignables");
  return data;
}
