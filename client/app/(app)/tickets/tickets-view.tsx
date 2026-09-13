"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { ArrowRight, LifeBuoy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { listPedidos } from "@/api/pedidos.api";
import {
  createTicket,
  listTickets,
  updateTicket,
  type CreateTicketInput,
  type EstadoTicket,
  type PrioridadTicket,
  type Ticket,
  type TipoTicket,
} from "@/api/tickets.api";
import { listAsignables } from "@/api/usuarios.api";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const estados: EstadoTicket[] = ["abierto", "en_proceso", "resuelto", "cerrado"];
const tipos: TipoTicket[] = ["seguimiento", "incidencia", "consulta", "devolucion"];
const prioridades: PrioridadTicket[] = ["baja", "media", "alta", "urgente"];

const estadoLabels: Record<EstadoTicket, string> = {
  abierto: "Abierto",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
};

const tipoLabels: Record<TipoTicket, string> = {
  seguimiento: "Seguimiento",
  incidencia: "Incidencia",
  consulta: "Consulta",
  devolucion: "Devolución",
};

const prioridadLabels: Record<PrioridadTicket, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

const estadoDot: Record<EstadoTicket, string> = {
  abierto: "bg-warning",
  en_proceso: "bg-info",
  resuelto: "bg-success",
  cerrado: "bg-muted-foreground",
};

const prioridadDot: Record<PrioridadTicket, string> = {
  baja: "bg-muted-foreground",
  media: "bg-info",
  alta: "bg-warning",
  urgente: "bg-destructive",
};

function siguienteEstado(estado: EstadoTicket): EstadoTicket | null {
  const idx = estados.indexOf(estado);
  if (idx === -1 || idx === estados.length - 1) return null;
  return estados[idx + 1] ?? null;
}

function errorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error) && typeof error.response?.data?.message === "string") {
    return error.response.data.message as string;
  }
  return fallback;
}

function emptyDraft(): CreateTicketInput & { id?: number; estado: EstadoTicket } {
  return {
    asunto: "",
    descripcion: "",
    tipo: "consulta",
    prioridad: "media",
    estado: "abierto",
    pedidoId: undefined,
    asignadoA: undefined,
  };
}

export function TicketsView() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<
    (CreateTicketInput & { id?: number; estado: EstadoTicket }) | null
  >(null);
  const [isNew, setIsNew] = useState(false);

  const ticketsQuery = useQuery({ queryKey: ["tickets"], queryFn: () => listTickets() });
  const pedidosQuery = useQuery({ queryKey: ["pedidos"], queryFn: () => listPedidos() });
  const usuariosQuery = useQuery({ queryKey: ["usuarios-asignables"], queryFn: listAsignables });

  const tickets = ticketsQuery.data ?? [];
  const pedidos = pedidosQuery.data ?? [];
  const asignables = usuariosQuery.data ?? [];

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["tickets"] });

  const crearMutation = useMutation({
    mutationFn: (dto: CreateTicketInput) => createTicket(dto),
    onSuccess: () => {
      invalidar();
      setDraft(null);
      toast.success("Ticket creado");
    },
    onError: (error) => toast.error(errorMessage(error, "No se pudo crear el ticket")),
  });

  const actualizarMutation = useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: number;
      dto: Partial<CreateTicketInput> & { estado?: EstadoTicket };
    }) => updateTicket(id, dto),
    onSuccess: () => {
      invalidar();
      toast.success("Ticket actualizado");
    },
    onError: (error) => toast.error(errorMessage(error, "No se pudo actualizar el ticket")),
  });

  const clienteDe = (ticket: Ticket) => {
    if (!ticket.pedidoId) return null;
    return pedidos.find((p) => p.id === ticket.pedidoId)?.cliente.nombre ?? null;
  };

  const guardando = crearMutation.isPending;

  return (
    <AppShell
      breadcrumb="Atención al cliente"
      title="Tickets de atención"
      actions={
        <Button
          onClick={() => {
            setDraft(emptyDraft());
            setIsNew(true);
          }}
        >
          <LifeBuoy className="size-4" /> Crear ticket
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-4">
        {estados.map((estado) => {
          const columna = tickets.filter((ticket) => ticket.estado === estado);
          return (
            <section key={estado} className="panel flex flex-col gap-3 bg-secondary/40 p-3">
              <header className="flex items-center gap-2 px-1">
                <span className={`size-2 rounded-full ${estadoDot[estado]}`} />
                <h2 className="text-sm font-medium">{estadoLabels[estado]}</h2>
                <span className="text-xs text-muted-foreground">{columna.length}</span>
              </header>

              {ticketsQuery.isLoading ? (
                <p className="px-1 text-xs text-muted-foreground">Cargando…</p>
              ) : (
                columna.map((ticket) => {
                  const cliente = clienteDe(ticket);
                  const siguiente = siguienteEstado(ticket.estado);
                  return (
                    <article key={ticket.id} className="panel space-y-3 border border-border p-4">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          className="text-left"
                          onClick={() => {
                            setDraft({
                              id: ticket.id,
                              asunto: ticket.asunto,
                              descripcion: ticket.descripcion ?? "",
                              tipo: ticket.tipo ?? "consulta",
                              prioridad: ticket.prioridad ?? "media",
                              estado: ticket.estado,
                              pedidoId: ticket.pedidoId ?? undefined,
                              asignadoA: ticket.asignadoA ?? undefined,
                            });
                            setIsNew(false);
                          }}
                        >
                          <p className="font-display text-base font-medium leading-tight tracking-tight hover:text-primary">
                            {ticket.asunto}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">TCK-{ticket.id}</p>
                        </button>
                        {ticket.prioridad ? (
                          <span
                            className={`mt-1 size-2 shrink-0 rounded-full ${prioridadDot[ticket.prioridad]}`}
                          />
                        ) : null}
                      </div>

                      {ticket.descripcion ? (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {ticket.descripcion}
                        </p>
                      ) : null}

                      <div className="flex flex-wrap items-center gap-1.5">
                        {ticket.tipo ? (
                          <Badge variant="outline">{tipoLabels[ticket.tipo]}</Badge>
                        ) : null}
                        {ticket.prioridad ? (
                          <Badge variant="outline">{prioridadLabels[ticket.prioridad]}</Badge>
                        ) : null}
                      </div>

                      <div className="space-y-1 border-t border-border pt-2 text-xs text-muted-foreground">
                        <p className="truncate">Cliente: {cliente ?? "Sin pedido vinculado"}</p>
                        {ticket.pedidoId ? (
                          <p className="truncate">Pedido: PED-{ticket.pedidoId}</p>
                        ) : null}
                        <p className="truncate">
                          {ticket.asignado ? `Asignado a ${ticket.asignado.nombre}` : "Sin asignar"}
                        </p>
                      </div>

                      {siguiente ? (
                        <div className="flex items-center justify-end pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              actualizarMutation.mutate({
                                id: ticket.id,
                                dto: { estado: siguiente },
                              })
                            }
                          >
                            {estadoLabels[siguiente]}
                            <ArrowRight className="size-3.5" />
                          </Button>
                        </div>
                      ) : null}
                    </article>
                  );
                })
              )}

              {!ticketsQuery.isLoading && columna.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground">Sin tickets aquí.</p>
              ) : null}
            </section>
          );
        })}
      </div>

      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "Crear ticket" : `Ticket TCK-${draft?.id}`}</DialogTitle>
            <DialogDescription>
              Registrá un caso o reporte de atención al cliente. Enlazarlo a un pedido es opcional.
            </DialogDescription>
          </DialogHeader>
          {draft ? (
            <form
              id="ticket-form"
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!draft.asunto.trim()) {
                  toast.error("Agregá el asunto");
                  return;
                }

                const dto: CreateTicketInput & { estado?: EstadoTicket } = {
                  asunto: draft.asunto.trim(),
                  descripcion: draft.descripcion || undefined,
                  tipo: draft.tipo,
                  prioridad: draft.prioridad,
                  pedidoId: draft.pedidoId,
                  asignadoA: draft.asignadoA,
                  estado: draft.estado,
                };

                if (isNew) {
                  crearMutation.mutate(dto);
                } else if (draft.id !== undefined) {
                  actualizarMutation.mutate({ id: draft.id, dto });
                  setDraft(null);
                }
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="subject">Asunto</Label>
                  <Input
                    id="subject"
                    value={draft.asunto}
                    onChange={(event) => setDraft({ ...draft, asunto: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={draft.tipo}
                    onValueChange={(value) => setDraft({ ...draft, tipo: value as TipoTicket })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipoLabels[tipo]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prioridad</Label>
                  <Select
                    value={draft.prioridad}
                    onValueChange={(value) =>
                      setDraft({ ...draft, prioridad: value as PrioridadTicket })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {prioridades.map((prioridad) => (
                        <SelectItem key={prioridad} value={prioridad}>
                          {prioridadLabels[prioridad]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={draft.estado}
                    onValueChange={(value) => setDraft({ ...draft, estado: value as EstadoTicket })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estadoLabels[estado]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Asignado a</Label>
                  <Select
                    value={draft.asignadoA !== undefined ? String(draft.asignadoA) : "none"}
                    onValueChange={(value) =>
                      setDraft({
                        ...draft,
                        asignadoA: value === "none" ? undefined : Number(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin asignar</SelectItem>
                      {asignables.map((usuario) => (
                        <SelectItem key={usuario.id} value={String(usuario.id)}>
                          {usuario.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Pedido relacionado (opcional)</Label>
                  <Select
                    value={draft.pedidoId !== undefined ? String(draft.pedidoId) : "none"}
                    onValueChange={(value) =>
                      setDraft({
                        ...draft,
                        pedidoId: value === "none" ? undefined : Number(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguno</SelectItem>
                      {pedidos.map((pedido) => (
                        <SelectItem key={pedido.id} value={String(pedido.id)}>
                          PED-{pedido.id} · {pedido.cliente.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={draft.descripcion}
                  onChange={(event) => setDraft({ ...draft, descripcion: event.target.value })}
                  rows={4}
                />
              </div>
            </form>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Cancelar
            </Button>
            <Button type="submit" form="ticket-form" disabled={guardando}>
              {guardando ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
