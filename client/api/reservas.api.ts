import { api } from "./axios";

export type EstadoReserva = "pendiente" | "confirmada" | "cancelada" | "completada";

export type Reserva = {
  id: number;
  clienteId: number;
  usuarioId: number | null;
  fechaReserva: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  personas: number | null;
  mesaId: number | null;
  estado: EstadoReserva;
  notas: string | null;
  createdAt: string;
  updatedAt: string;
  cliente: { id: number; nombre: string };
  usuario: { id: number; nombre: string } | null;
  mesa: { id: number; nombre: string } | null;
};

export async function listReservas(estado?: EstadoReserva): Promise<Reserva[]> {
  const { data } = await api.get<Reserva[]>("/reservas", {
    params: estado ? { estado } : undefined,
  });
  return data;
}

export type CreateReservaInput = {
  clienteId: number;
  fechaInicio?: string;
  fechaFin?: string;
  personas?: number;
  mesaId?: number;
  notas?: string;
};

export async function createReserva(dto: CreateReservaInput): Promise<Reserva> {
  const { data } = await api.post<Reserva>("/reservas", dto);
  return data;
}

export type UpdateReservaInput = Partial<CreateReservaInput> & { estado?: EstadoReserva };

export async function updateReserva(id: number, dto: UpdateReservaInput): Promise<Reserva> {
  const { data } = await api.patch<Reserva>(`/reservas/${id}`, dto);
  return data;
}

export async function cancelReserva(id: number): Promise<Reserva> {
  const { data } = await api.delete<Reserva>(`/reservas/${id}`);
  return data;
}
