import { api } from "./axios";

export type EstadoProducto = "activo" | "inactivo" | "descontinuado";

export type ProductoDTO = {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string | null;
  categoriaId: number | null;
  precio: string;
  costo: string | null;
  stockActual: number;
  stockMinimo: number;
  imagenUrl: string | null;
  estado: EstadoProducto;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
  categoria: { id: number; nombre: string } | null;
};

export type Producto = Omit<ProductoDTO, "precio" | "costo"> & {
  precio: number;
  costo: number | null;
};

function normalizar(dto: ProductoDTO): Producto {
  return {
    ...dto,
    precio: Number(dto.precio),
    costo: dto.costo !== null ? Number(dto.costo) : null,
  };
}

export async function listProductos(estado?: EstadoProducto): Promise<Producto[]> {
  const { data } = await api.get<ProductoDTO[]>("/productos", {
    params: estado ? { estado } : undefined,
  });
  return data.map(normalizar);
}

export type CreateProductoInput = {
  sku: string;
  nombre: string;
  descripcion?: string;
  categoriaId?: number;
  precio: number;
  costo?: number;
  stockActual?: number;
  stockMinimo?: number;
  imagenUrl?: string;
};

export async function createProducto(dto: CreateProductoInput): Promise<Producto> {
  const { data } = await api.post<ProductoDTO>("/productos", dto);
  return normalizar(data);
}

export type UpdateProductoInput = Partial<CreateProductoInput> & { estado?: EstadoProducto };

export async function updateProducto(id: number, dto: UpdateProductoInput): Promise<Producto> {
  const { data } = await api.patch<ProductoDTO>(`/productos/${id}`, dto);
  return normalizar(data);
}

export async function deleteProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`);
}
