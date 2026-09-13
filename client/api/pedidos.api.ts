import { api } from "./axios";

export type EstadoPedido = "pendiente" | "en_proceso" | "enviado" | "entregado" | "cancelado";

export type PedidoItemDTO = {
  id: number;
  productoId: number;
  cantidad: number;
  precioUnitario: string;
  subtotal: string;
  producto: { id: number; nombre: string; sku: string };
};

export type PedidoItem = Omit<PedidoItemDTO, "precioUnitario" | "subtotal"> & {
  precioUnitario: number;
  subtotal: number;
};

export type PedidoDTO = {
  id: number;
  clienteId: number;
  reservaId: number | null;
  usuarioId: number | null;
  mesaId: number | null;
  fechaPedido: string;
  estado: EstadoPedido;
  total: string;
  direccionEnvio: string | null;
  createdAt: string;
  updatedAt: string;
  cliente: { id: number; nombre: string };
  usuario: { id: number; nombre: string } | null;
  mesa: { id: number; nombre: string } | null;
  pedidoDetalles: PedidoItemDTO[];
};

export type Pedido = Omit<PedidoDTO, "total" | "pedidoDetalles"> & {
  total: number;
  items: PedidoItem[];
};

function normalizarItem(dto: PedidoItemDTO): PedidoItem {
  return {
    ...dto,
    precioUnitario: Number(dto.precioUnitario),
    subtotal: Number(dto.subtotal),
  };
}

function normalizar(dto: PedidoDTO): Pedido {
  const { pedidoDetalles, ...resto } = dto;
  return {
    ...resto,
    total: Number(dto.total),
    items: pedidoDetalles.map(normalizarItem),
  };
}

export async function listPedidos(estado?: EstadoPedido): Promise<Pedido[]> {
  const { data } = await api.get<PedidoDTO[]>("/pedidos", {
    params: estado ? { estado } : undefined,
  });
  return data.map(normalizar);
}

export async function getPedido(id: number): Promise<Pedido> {
  const { data } = await api.get<PedidoDTO>(`/pedidos/${id}`);
  return normalizar(data);
}

export async function createPedido(dto: {
  clienteId: number;
  direccionEnvio?: string;
  mesaId?: number;
}): Promise<Pedido> {
  const { data } = await api.post<PedidoDTO>("/pedidos", dto);
  return normalizar(data);
}

export async function updatePedido(
  id: number,
  dto: { clienteId?: number; direccionEnvio?: string; estado?: EstadoPedido; mesaId?: number },
): Promise<Pedido> {
  const { data } = await api.patch<PedidoDTO>(`/pedidos/${id}`, dto);
  return normalizar(data);
}

export async function cancelPedido(id: number): Promise<Pedido> {
  const { data } = await api.delete<PedidoDTO>(`/pedidos/${id}`);
  return normalizar(data);
}

export async function addItem(
  pedidoId: number,
  dto: { productoId: number; cantidad: number },
): Promise<PedidoItem> {
  const { data } = await api.post<PedidoItemDTO>(`/pedidos/${pedidoId}/items`, dto);
  return normalizarItem(data);
}

export async function updateItem(
  pedidoId: number,
  itemId: number,
  dto: { cantidad: number },
): Promise<PedidoItem> {
  const { data } = await api.patch<PedidoItemDTO>(`/pedidos/${pedidoId}/items/${itemId}`, dto);
  return normalizarItem(data);
}

export async function removeItem(pedidoId: number, itemId: number): Promise<void> {
  await api.delete(`/pedidos/${pedidoId}/items/${itemId}`);
}
