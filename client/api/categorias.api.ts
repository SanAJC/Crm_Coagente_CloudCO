import { api } from "./axios";

export type Categoria = {
  id: number;
  nombre: string;
  descripcion: string | null;
};

export async function listCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>("/categorias");
  return data;
}

export async function createCategoria(dto: {
  nombre: string;
  descripcion?: string;
}): Promise<Categoria> {
  const { data } = await api.post<Categoria>("/categorias", dto);
  return data;
}
