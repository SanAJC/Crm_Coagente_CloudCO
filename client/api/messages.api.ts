import { api } from "./axios";

export type Canal = "whatsapp" | "telegram" | "instagram";
export type EstadoConversacion = "abierta" | "cerrada" | "archivada";
export type Remitente = "cliente" | "agente" | "sistema";
export type TipoContenido = "texto" | "imagen" | "audio" | "video" | "documento" | "ubicacion";

export type ClienteResumen = {
  id: number;
  nombre: string;
  email: string | null;
  telefono: string | null;
};

export type Conversacion = {
  id: number;
  clienteId: number | null;
  canal: Canal;
  canalChatId: string;
  ticketId: number | null;
  estado: EstadoConversacion;
  ultimoMensajeAt: string | null;
  createdAt: string;
  cliente: ClienteResumen | null;
};

export type Mensaje = {
  id: number;
  conversacionId: number;
  canalMensajeId: string | null;
  remitente: Remitente;
  tipoContenido: TipoContenido;
  contenido: string | null;
  urlAdjunto: string | null;
  metadata: Record<string, unknown> | null;
  enviadoPorUsuarioId: number | null;
  createdAt: string;
};

export async function listConversaciones(estado?: EstadoConversacion): Promise<Conversacion[]> {
  const { data } = await api.get<Conversacion[]>("/conversaciones", {
    params: estado ? { estado } : undefined,
  });
  return data;
}

export async function getConversacion(id: number): Promise<Conversacion> {
  const { data } = await api.get<Conversacion>(`/conversaciones/${id}`);
  return data;
}

export async function listMensajes(conversacionId: number): Promise<Mensaje[]> {
  const { data } = await api.get<Mensaje[]>(`/conversaciones/${conversacionId}/mensajes`);
  return data;
}

export async function updateConversacion(
  id: number,
  dto: { estado?: EstadoConversacion; clienteId?: number },
): Promise<Conversacion> {
  const { data } = await api.patch<Conversacion>(`/conversaciones/${id}`, dto);
  return data;
}

export async function enviarMensaje(
  conversacionId: number,
  dto: { tipoContenido?: TipoContenido; contenido?: string; urlAdjunto?: string },
): Promise<Mensaje & { entregado: boolean }> {
  const { data } = await api.post<Mensaje & { entregado: boolean }>(
    `/conversaciones/${conversacionId}/mensajes`,
    dto,
  );
  return data;
}
