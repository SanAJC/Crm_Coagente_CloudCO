import { api } from "./axios";

export type Cliente = {
  id: number;
  nombre: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  tipoCliente: string | null;
};

export async function listClientes(): Promise<Cliente[]> {
  const { data } = await api.get<Cliente[]>("/clientes");
  return data;
}
