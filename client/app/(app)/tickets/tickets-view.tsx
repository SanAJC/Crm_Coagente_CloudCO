"use client";

import { ArrowRight, LifeBuoy, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
import {
  ticketPriorityLabels,
  ticketStatusLabels,
  ticketTypeLabels,
  type SupportTicket,
  type TicketPriority,
  type TicketStatus,
  type TicketType,
} from "@/lib/crm-data";
import { newId, useCrm } from "@/lib/crm-store";

const statuses: TicketStatus[] = ["abierto", "en_proceso", "resuelto", "cerrado"];
const types: TicketType[] = ["seguimiento", "incidencia", "consulta", "devolucion"];
const priorities: TicketPriority[] = ["baja", "media", "alta", "urgente"];

const statusDot: Record<TicketStatus, string> = {
  abierto: "bg-warning",
  en_proceso: "bg-info",
  resuelto: "bg-success",
  cerrado: "bg-muted-foreground",
};

const priorityDot: Record<TicketPriority, string> = {
  baja: "bg-muted-foreground",
  media: "bg-info",
  alta: "bg-warning",
  urgente: "bg-destructive",
};

const nextStatus = (status: TicketStatus) =>
  statuses[Math.min(statuses.indexOf(status) + 1, statuses.length - 1)]!;

const emptyTicket = (): SupportTicket => ({
  id: newId(),
  code: `TCK-${Math.floor(1010 + Math.random() * 90)}`,
  subject: "",
  description: "",
  customer: "",
  type: "consulta",
  priority: "media",
  status: "abierto",
  createdAt: new Date().toISOString().slice(0, 16),
});

export function TicketsView() {
  const { supportTickets, orders, team, saveSupportTicket, moveSupportTicket, deleteSupportTicket } =
    useCrm();
  const [draft, setDraft] = useState<SupportTicket | null>(null);
  const [isNew, setIsNew] = useState(false);

  return (
    <AppShell
      breadcrumb="Atención al cliente"
      title="Tickets de atención"
      actions={
        <Button
          onClick={() => {
            setDraft(emptyTicket());
            setIsNew(true);
          }}
        >
          <LifeBuoy className="size-4" /> Crear ticket
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-4">
        {statuses.map((status) => {
          const column = supportTickets.filter((ticket) => ticket.status === status);
          return (
            <section key={status} className="panel flex flex-col gap-3 bg-secondary/40 p-3">
              <header className="flex items-center gap-2 px-1">
                <span className={`size-2 rounded-full ${statusDot[status]}`} />
                <h2 className="text-sm font-medium">{ticketStatusLabels[status]}</h2>
                <span className="text-xs text-muted-foreground">{column.length}</span>
              </header>

              {column.map((ticket) => {
                const order = orders.find((o) => o.id === ticket.orderId);
                return (
                  <article
                    key={ticket.id}
                    className="panel space-y-3 border border-border p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        className="text-left"
                        onClick={() => {
                          setDraft({ ...ticket });
                          setIsNew(false);
                        }}
                      >
                        <p className="font-display text-base font-medium leading-tight tracking-tight hover:text-primary">
                          {ticket.subject}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{ticket.code}</p>
                      </button>
                      <span className={`mt-1 size-2 shrink-0 rounded-full ${priorityDot[ticket.priority]}`} />
                    </div>

                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {ticket.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline">{ticketTypeLabels[ticket.type]}</Badge>
                      <Badge variant="outline">{ticketPriorityLabels[ticket.priority]}</Badge>
                    </div>

                    <div className="space-y-1 border-t border-border pt-2 text-xs text-muted-foreground">
                      <p className="truncate">Cliente: {ticket.customer}</p>
                      {order ? <p className="truncate">Pedido: {order.code}</p> : null}
                      <p className="truncate">
                        {ticket.assignee ? `Asignado a ${ticket.assignee}` : "Sin asignar"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      {ticket.status === "cerrado" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Eliminar ${ticket.code}`}
                          onClick={() => {
                            deleteSupportTicket(ticket.id);
                            toast.success("Ticket eliminado");
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      ) : (
                        <span />
                      )}
                      {ticket.status !== "cerrado" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveSupportTicket(ticket.id, nextStatus(ticket.status))}
                        >
                          {ticketStatusLabels[nextStatus(ticket.status)]}
                          <ArrowRight className="size-3.5" />
                        </Button>
                      ) : null}
                    </div>
                  </article>
                );
              })}

              {column.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground">Sin tickets aquí.</p>
              ) : null}
            </section>
          );
        })}
      </div>

      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "Crear ticket" : `Ticket ${draft?.code}`}</DialogTitle>
            <DialogDescription>
              Registra un caso o reporte de atención al cliente. Enlazarlo a un pedido es opcional.
            </DialogDescription>
          </DialogHeader>
          {draft ? (
            <form
              id="ticket-form"
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!draft.subject.trim() || !draft.customer.trim()) {
                  toast.error("Agrega el asunto y el cliente");
                  return;
                }
                saveSupportTicket(draft);
                setDraft(null);
                toast.success(isNew ? "Ticket creado" : "Ticket actualizado");
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="subject">Asunto</Label>
                  <Input
                    id="subject"
                    value={draft.subject}
                    onChange={(event) => setDraft({ ...draft, subject: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer">Cliente</Label>
                  <Input
                    id="customer"
                    value={draft.customer}
                    onChange={(event) => setDraft({ ...draft, customer: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={draft.type}
                    onValueChange={(value) => setDraft({ ...draft, type: value as TicketType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type} value={type}>
                          {ticketTypeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prioridad</Label>
                  <Select
                    value={draft.priority}
                    onValueChange={(value) =>
                      setDraft({ ...draft, priority: value as TicketPriority })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {ticketPriorityLabels[priority]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={draft.status}
                    onValueChange={(value) => setDraft({ ...draft, status: value as TicketStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {ticketStatusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Asignado a</Label>
                  <Select
                    value={draft.assignee ?? "none"}
                    onValueChange={(value) =>
                      setDraft({ ...draft, assignee: value === "none" ? undefined : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin asignar</SelectItem>
                      {team.map((member) => (
                        <SelectItem key={member.id} value={member.name}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Pedido relacionado (opcional)</Label>
                  <Select
                    value={draft.orderId ?? "none"}
                    onValueChange={(value) =>
                      setDraft({ ...draft, orderId: value === "none" ? undefined : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguno</SelectItem>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.code} · {order.customer}
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
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                  rows={4}
                />
              </div>
            </form>
          ) : null}
          <DialogFooter className="sm:justify-between">
            {!isNew && draft ? (
              <Button
                variant="ghost"
                onClick={() => {
                  deleteSupportTicket(draft.id);
                  setDraft(null);
                  toast.success("Ticket eliminado");
                }}
              >
                <Trash2 className="size-4" /> Eliminar
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDraft(null)}>
                Cancelar
              </Button>
              <Button type="submit" form="ticket-form">
                Guardar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
