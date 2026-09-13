import { api } from "./axios";

export type TipoTicket = "seguimiento" | "incidencia" | "consulta" | "devolucion";
export type PrioridadTicket = "baja" | "media" | "alta" | "urgente";
export type EstadoTicket = "abierto" | "en_proceso" | "resuelto" | "cerrado";

export type Ticket = {
  id: number;
  pedidoId: number | null;
  tipo: TipoTicket | null;
  asunto: string;
  descripcion: string | null;
  prioridad: PrioridadTicket | null;
  estado: EstadoTicket;
  asignadoA: number | null;
  creadoPor: number | null;
  createdAt: string;
  updatedAt: string;
  fechaResolucion: string | null;
  asignado: { id: number; nombre: string } | null;
  creador: { id: number; nombre: string } | null;
};

export async function listTickets(estado?: EstadoTicket): Promise<Ticket[]> {
  const { data } = await api.get<Ticket[]>("/tickets", {
    params: estado ? { estado } : undefined,
  });
  return data;
}

export type CreateTicketInput = {
  asunto: string;
  descripcion?: string;
  pedidoId?: number;
  tipo?: TipoTicket;
  prioridad?: PrioridadTicket;
  asignadoA?: number;
};

export async function createTicket(dto: CreateTicketInput): Promise<Ticket> {
  const { data } = await api.post<Ticket>("/tickets", dto);
  return data;
}

export type UpdateTicketInput = Partial<CreateTicketInput> & { estado?: EstadoTicket };

export async function updateTicket(id: number, dto: UpdateTicketInput): Promise<Ticket> {
  const { data } = await api.patch<Ticket>(`/tickets/${id}`, dto);
  return data;
}

export async function closeTicket(id: number): Promise<Ticket> {
  const { data } = await api.delete<Ticket>(`/tickets/${id}`);
  return data;
}
