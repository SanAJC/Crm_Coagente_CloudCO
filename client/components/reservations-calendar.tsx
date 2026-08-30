"use client";

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
  buildTimeSlots,
  statusLabels,
  todayISO,
  weekdayLabels,
  type Reservation,
  type ReservationStatus,
} from "@/lib/crm-data";
import { newId, useCrm } from "@/lib/crm-store";
import { cn } from "@/lib/utils";

const statuses: ReservationStatus[] = ["pendiente", "confirmada", "sentada", "cancelada"];

const statusStyles: Record<ReservationStatus, string> = {
  confirmada: "border-l-info bg-info/10",
  pendiente: "border-l-warning bg-warning/10",
  sentada: "border-l-success bg-success/10",
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

const emptyReservation = (date: string, time: string, table: string): Reservation => ({
  id: newId(),
  guest: "",
  phone: "",
  people: 2,
  date,
  time,
  table,
  status: "pendiente",
  note: "",
});

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
  const { reservations, saveReservation, deleteReservation, calendarSettings } = useCrm();
  const [day, setDay] = useState(initialDate);
  const [draft, setDraft] = useState<Reservation | null>(null);
  const [isNew, setIsNew] = useState(false);

  const slots = useMemo(() => buildTimeSlots(calendarSettings), [calendarSettings]);
  const dayOfWeek = new Date(`${day}T00:00:00`).getDay();
  const isClosed = calendarSettings.closedDays.includes(dayOfWeek);

  const dayList = useMemo(
    () => reservations.filter((r) => r.date === day).sort((a, b) => a.time.localeCompare(b.time)),
    [reservations, day],
  );
  const guests = dayList
    .filter((r) => r.status !== "cancelada")
    .reduce((sum, r) => sum + r.people, 0);

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
            const items = dayList.filter((r) => r.time === slot);
            return (
              <div
                key={slot}
                className="grid grid-cols-[64px_1fr] border-b border-border last:border-b-0"
              >
                <div className="border-r border-border p-3 text-xs font-medium tabular-nums text-muted-foreground">
                  {slot}
                </div>
                <div className="flex flex-wrap gap-2 p-3">
                  {items.map((reservation) => (
                    <button
                      key={reservation.id}
                      type="button"
                      onClick={() => {
                        setDraft({ ...reservation });
                        setIsNew(false);
                      }}
                      className={cn(
                        "w-full max-w-xs rounded-lg border border-border border-l-4 p-3 text-left transition-shadow hover:shadow-lift",
                        statusStyles[reservation.status],
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">{reservation.guest}</p>
                        <Badge variant="outline">{statusLabels[reservation.status]}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {reservation.people} pax · {reservation.table}
                      </p>
                      {reservation.note ? (
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {reservation.note}
                        </p>
                      ) : null}
                    </button>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => {
                      setDraft(emptyReservation(day, slot, calendarSettings.tables[0] ?? "Mesa 1"));
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
            <DialogDescription>Datos de contacto, franja y estado de la mesa.</DialogDescription>
          </DialogHeader>
          {draft ? (
            <form
              id="reservation-form"
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!draft.guest.trim()) return;
                saveReservation(draft);
                setDraft(null);
                toast.success(isNew ? "Reserva creada" : "Reserva actualizada");
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guest">Cliente</Label>
                  <Input
                    id="guest"
                    value={draft.guest}
                    onChange={(event) => setDraft({ ...draft, guest: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={draft.phone}
                    onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
                  />
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
                    max={calendarSettings.maxPartySize}
                    value={draft.people}
                    onChange={(event) => setDraft({ ...draft, people: Number(event.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mesa / zona</Label>
                  <Select
                    value={draft.table}
                    onValueChange={(value) => setDraft({ ...draft, table: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {calendarSettings.tables.map((table) => (
                        <SelectItem key={table} value={table}>
                          {table}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={draft.status}
                  onValueChange={(value) =>
                    setDraft({ ...draft, status: value as ReservationStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {statusLabels[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Nota interna</Label>
                <Textarea
                  id="note"
                  value={draft.note}
                  onChange={(event) => setDraft({ ...draft, note: event.target.value })}
                />
              </div>
            </form>
          ) : null}
          <DialogFooter className="sm:justify-between">
            {!isNew && draft ? (
              <Button
                variant="ghost"
                onClick={() => {
                  deleteReservation(draft.id);
                  setDraft(null);
                  toast.success("Reserva eliminada");
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
              <Button type="submit" form="reservation-form">
                Guardar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
