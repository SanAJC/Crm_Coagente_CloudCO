import { api } from "./axios";

export type Mesa = {
  id: number;
  nombre: string;
  activa: boolean;
};

export async function listMesas(activa?: boolean): Promise<Mesa[]> {
  const { data } = await api.get<Mesa[]>("/settings/mesas", {
    params: activa !== undefined ? { activa: String(activa) } : undefined,
  });
  return data;
}

export async function createMesa(nombre: string): Promise<Mesa> {
  const { data } = await api.post<Mesa>("/settings/mesas", { nombre });
  return data;
}

export async function updateMesa(
  id: number,
  dto: { nombre?: string; activa?: boolean },
): Promise<Mesa> {
  const { data } = await api.patch<Mesa>(`/settings/mesas/${id}`, dto);
  return data;
}

export async function deleteMesa(id: number): Promise<Mesa> {
  const { data } = await api.delete<Mesa>(`/settings/mesas/${id}`);
  return data;
}

export type ConfiguracionNegocio = {
  id: number;
  horaApertura: string;
  horaCierre: string;
  intervaloMinutos: number;
  bufferMinutos: number;
  tamanoMaximoGrupo: number;
  diasCerrados: number[];
  updatedAt: string;
};

export type UpdateConfiguracionInput = Partial<Omit<ConfiguracionNegocio, "id" | "updatedAt">>;

export async function getConfiguracion(): Promise<ConfiguracionNegocio> {
  const { data } = await api.get<ConfiguracionNegocio>("/settings/negocio");
  return data;
}

export async function updateConfiguracion(
  dto: UpdateConfiguracionInput,
): Promise<ConfiguracionNegocio> {
  const { data } = await api.patch<ConfiguracionNegocio>("/settings/negocio", dto);
  return data;
}
