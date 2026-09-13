"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  CalendarDays,
  CalendarOff,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { createCliente, listClientes } from "@/api/clientes.api";
import {
  cancelReserva,
  createReserva,
  listReservas,
  updateReserva,
  type EstadoReserva,
  type Reserva,
} from "@/api/reservas.api";
import { getConfiguracion, listMesas } from "@/api/settings.api";
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
import { buildTimeSlots, todayISO, weekdayLabels } from "@/lib/crm-data";
import { cn } from "@/lib/utils";

const estados: EstadoReserva[] = ["pendiente", "confirmada", "completada", "cancelada"];

const estadoLabels: Record<EstadoReserva, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
};

const estadoStyles: Record<EstadoReserva, string> = {
  confirmada: "border-l-info bg-info/10",
  pendiente: "border-l-warning bg-warning/10",
  completada: "border-l-success bg-success/10",
  cancelada: "border-l-destructive bg-destructive/10 opacity-70",
};

export const shiftDate = (date: string, days: number) => {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const longDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

function dateKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function timeKey(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function errorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error) && typeof error.response?.data?.message === "string") {
    return error.response.data.message as string;
  }
  return fallback;
}

type Draft = {
  id?: number;
  clienteId: number | undefined;
  date: string;
  time: string;
  personas: number;
  mesaId: number | undefined;
  estado: EstadoReserva;
  notas: string;
};

const DEFAULT_SLOT_CONFIG = {
  openTime: "12:00",
  closeTime: "22:30",
  slotIntervalMinutes: 30,
  bufferMinutes: 0,
  maxPartySize: 12,
  closedDays: [] as number[],
  tables: [] as string[],
};

interface ReservationsCalendarProps {
  initialDate?: string;
  showTitle?: boolean;
  lockToDay?: boolean;
  fill?: boolean;
}

export function ReservationsCalendar({
  initialDate = todayISO,
  showTitle = true,
  lockToDay = false,
  fill = false,
}: ReservationsCalendarProps) {
  const queryClient = useQueryClient();
  const [day, setDay] = useState(initialDate);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [clienteRapidoAbierto, setClienteRapidoAbierto] = useState(false);
  const [clienteRapido, setClienteRapido] = useState({ nombre: "", telefono: "", email: "" });

  const reservasQuery = useQuery({ queryKey: ["reservas"], queryFn: () => listReservas() });
  const clientesQuery = useQuery({ queryKey: ["clientes"], queryFn: listClientes });
  const mesasQuery = useQuery({ queryKey: ["mesas"], queryFn: () => listMesas(true) });
  const configQuery = useQuery({ queryKey: ["configuracion-negocio"], queryFn: getConfiguracion });

  const clientes = clientesQuery.data ?? [];
  const mesas = mesasQuery.data ?? [];
  const config = configQuery.data;

  const slotConfig = useMemo(
    () =>
      config
        ? {
            ...DEFAULT_SLOT_CONFIG,
            openTime: config.horaApertura,
            closeTime: config.horaCierre,
            slotIntervalMinutes: config.intervaloMinutos,
          }
        : DEFAULT_SLOT_CONFIG,
    [config],
  );
  const slots = useMemo(() => buildTimeSlots(slotConfig), [slotConfig]);
  const maxPartySize = config?.tamanoMaximoGrupo ?? DEFAULT_SLOT_CONFIG.maxPartySize;
  const dayOfWeek = new Date(`${day}T00:00:00`).getDay();
  const isClosed = (config?.diasCerrados ?? []).includes(dayOfWeek);

  const dayList = useMemo(
    () =>
      (reservasQuery.data ?? [])
        .filter((r) => r.fechaInicio && dateKey(r.fechaInicio) === day)
        .sort((a, b) => timeKey(a.fechaInicio!).localeCompare(timeKey(b.fechaInicio!))),
    [reservasQuery.data, day],
  );
  const guests = dayList
    .filter((r) => r.estado !== "cancelada")
    .reduce((sum, r) => sum + (r.personas ?? 0), 0);

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["reservas"] });

  const crearMutation = useMutation({
    mutationFn: (dto: Parameters<typeof createReserva>[0]) => createReserva(dto),
    onSuccess: () => {
      invalidar();
      setDraft(null);
      toast.success("Reserva creada");
    },
    onError: (error) => toast.error(errorMessage(error, "No se pudo crear la reserva")),
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Parameters<typeof updateReserva>[1] }) =>
      updateReserva(id, dto),
    onSuccess: () => {
      invalidar();
      setDraft(null);
      toast.success("Reserva actualizada");
    },
    onError: (error) => toast.error(errorMessage(error, "No se pudo actualizar la reserva")),
  });

  const cancelarMutation = useMutation({
    mutationFn: (id: number) => cancelReserva(id),
    onSuccess: () => {
      invalidar();
      setDraft(null);
      toast.success("Reserva cancelada");
    },
    onError: (error) => toast.error(errorMessage(error, "No se pudo cancelar la reserva")),
  });

  const crearClienteMutation = useMutation({
    mutationFn: () =>
      createCliente({
        nombre: clienteRapido.nombre.trim(),
        telefono: clienteRapido.telefono || undefined,
        email: clienteRapido.email || undefined,
      }),
    onSuccess: (cliente) => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      setClienteRapidoAbierto(false);
      setClienteRapido({ nombre: "", telefono: "", email: "" });
      setDraft((current) => (current ? { ...current, clienteId: cliente.id } : current));
      toast.success("Cliente creado");
    },
    onError: (error) => toast.error(errorMessage(error, "No se pudo crear el cliente")),
  });

  const emptyDraft = (date: string, time: string): Draft => ({
    clienteId: undefined,
    date,
    time,
    personas: 2,
    mesaId: mesas[0]?.id,
    estado: "pendiente",
    notas: "",
  });

  const draftFromReserva = (r: Reserva): Draft => ({
    id: r.id,
    clienteId: r.clienteId,
    date: r.fechaInicio ? dateKey(r.fechaInicio) : day,
    time: r.fechaInicio ? timeKey(r.fechaInicio) : slots[0] || "12:00",
    personas: r.personas ?? 2,
    mesaId: r.mesaId ?? undefined,
    estado: r.estado,
    notas: r.notas ?? "",
  });

  const guardar = () => {
    if (!draft) return;
    if (draft.clienteId === undefined) {
      toast.error("Elegí un cliente");
      return;
    }

    const fechaInicio = new Date(`${draft.date}T${draft.time}:00`);
    const fechaFin = new Date(fechaInicio.getTime() + 2 * 60 * 60 * 1000);

    const dto = {
      clienteId: draft.clienteId,
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString(),
      personas: draft.personas,
      mesaId: draft.mesaId,
      notas: draft.notas || undefined,
      estado: draft.estado,
    };

    if (isNew) {
      crearMutation.mutate(dto);
    } else if (draft.id !== undefined) {
      actualizarMutation.mutate({ id: draft.id, dto });
    }
  };

  const guardando = crearMutation.isPending || actualizarMutation.isPending;

  return (
    <div className={cn(fill && "flex h-full min-h-0 flex-col")}>
      <div className="panel flex flex-wrap items-center gap-3 p-4">
        {showTitle ? (
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CalendarDays className="size-4 text-primary" />
            Agenda
          </span>
        ) : null}
        <span className="flex items-center gap-2 text-sm font-medium">
          <CalendarDays className="size-4 text-muted-foreground" />
          {dayList.length} reservas
        </span>
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4" /> {guests} comensales
        </span>
        <div className="ml-auto flex items-center gap-2">
          {lockToDay ? (
            <p className="text-sm font-medium capitalize">{longDate(day)}</p>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setDay(todayISO)}>
                Hoy
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Día anterior"
                onClick={() => setDay((d) => shiftDate(d, -1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <p className="min-w-44 text-center text-sm font-medium capitalize">{longDate(day)}</p>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Día siguiente"
                onClick={() => setDay((d) => shiftDate(d, 1))}
              >
                <ChevronRight className="size-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className={cn("panel mt-4 overflow-auto", fill ? "min-h-0 flex-1" : "max-h-[520px]")}>
        {isClosed ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12 text-center">
            <CalendarOff className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">Cerrado este día</p>
            <p className="text-xs text-muted-foreground">
              {weekdayLabels[dayOfWeek]} está marcado como no laborable en Configuración →
              Calendario.
            </p>
          </div>
        ) : (
          slots.map((slot) => {
            const items = dayList.filter((r) => r.fechaInicio && timeKey(r.fechaInicio) === slot);
            return (
              <div
                key={slot}
                className="grid grid-cols-[64px_1fr] border-b border-border last:border-b-0"
              >
                <div className="border-r border-border p-3 text-xs font-medium tabular-nums text-muted-foreground">
                  {slot}
                </div>
                <div className="flex flex-wrap gap-2 p-3">
                  {items.map((reserva) => (
                    <button
                      key={reserva.id}
                      type="button"
                      onClick={() => {
                        setDraft(draftFromReserva(reserva));
                        setIsNew(false);
                      }}
                      className={cn(
                        "w-full max-w-xs rounded-lg border border-border border-l-4 p-3 text-left transition-shadow hover:shadow-lift",
                        estadoStyles[reserva.estado],
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">{reserva.cliente.nombre}</p>
                        <Badge variant="outline">{estadoLabels[reserva.estado]}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {reserva.personas ?? "—"} pax · {reserva.mesa?.nombre ?? "Sin mesa"}
                      </p>
                      {reserva.notas ? (
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {reserva.notas}
                        </p>
                      ) : null}
                    </button>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => {
                      setDraft(emptyDraft(day, slot));
                      setIsNew(true);
                    }}
                  >
                    <Plus className="size-3.5" /> Agregar
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNew ? "Nueva reserva" : "Editar reserva"}</DialogTitle>
            <DialogDescription>Cliente, franja horaria y estado de la mesa.</DialogDescription>
          </DialogHeader>
          {draft ? (
            <form
              id="reservation-form"
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                guardar();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Cliente</Label>
                  <div className="flex gap-2">
                    <Select
                      value={draft.clienteId !== undefined ? String(draft.clienteId) : ""}
                      onValueChange={(value) => setDraft({ ...draft, clienteId: Number(value) })}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Elegir cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Crear cliente nuevo"
                      onClick={() => setClienteRapidoAbierto(true)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={draft.date}
                    onChange={(event) => setDraft({ ...draft, date: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora</Label>
                  <Select
                    value={draft.time}
                    onValueChange={(value) => setDraft({ ...draft, time: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {slots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="people">Personas</Label>
                  <Input
                    id="people"
                    type="number"
                    min={1}
                    max={maxPartySize}
                    value={draft.personas}
                    onChange={(event) =>
                      setDraft({ ...draft, personas: Number(event.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mesa / zona</Label>
                  <Select
                    value={draft.mesaId !== undefined ? String(draft.mesaId) : ""}
                    onValueChange={(value) => setDraft({ ...draft, mesaId: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Elegir mesa" />
                    </SelectTrigger>
                    <SelectContent>
                      {mesas.map((mesa) => (
                        <SelectItem key={mesa.id} value={String(mesa.id)}>
                          {mesa.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={draft.estado}
                  onValueChange={(value) => setDraft({ ...draft, estado: value as EstadoReserva })}
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
                <Label htmlFor="note">Nota interna</Label>
                <Textarea
                  id="note"
                  value={draft.notas}
                  onChange={(event) => setDraft({ ...draft, notas: event.target.value })}
                />
              </div>
            </form>
          ) : null}
          <DialogFooter className="sm:justify-between">
            {!isNew && draft?.id !== undefined ? (
              <Button
                variant="ghost"
                onClick={() => cancelarMutation.mutate(draft.id!)}
                disabled={cancelarMutation.isPending}
              >
                <Trash2 className="size-4" /> Cancelar reserva
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDraft(null)}>
                Cerrar
              </Button>
              <Button type="submit" form="reservation-form" disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={clienteRapidoAbierto} onOpenChange={setClienteRapidoAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cliente nuevo</DialogTitle>
            <DialogDescription>Solo lo básico para poder asociarlo a la reserva.</DialogDescription>
          </DialogHeader>
          <form
            id="cliente-rapido-form"
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!clienteRapido.nombre.trim()) {
                toast.error("Agregá el nombre");
                return;
              }
              crearClienteMutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="cr-nombre">Nombre</Label>
              <Input
                id="cr-nombre"
                value={clienteRapido.nombre}
                onChange={(event) =>
                  setClienteRapido({ ...clienteRapido, nombre: event.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cr-telefono">Teléfono</Label>
              <Input
                id="cr-telefono"
                value={clienteRapido.telefono}
                onChange={(event) =>
                  setClienteRapido({ ...clienteRapido, telefono: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cr-email">Email (opcional)</Label>
              <Input
                id="cr-email"
                type="email"
                value={clienteRapido.email}
                onChange={(event) =>
                  setClienteRapido({ ...clienteRapido, email: event.target.value })
                }
              />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClienteRapidoAbierto(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="cliente-rapido-form"
              disabled={crearClienteMutation.isPending}
            >
              {crearClienteMutation.isPending ? "Creando…" : "Crear cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
