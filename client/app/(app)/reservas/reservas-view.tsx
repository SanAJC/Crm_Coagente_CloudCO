"use client";

import { AppShell } from "@/components/app-shell";
import { ReservationsCalendar } from "@/components/reservations-calendar";

export function ReservasView() {
  return (
    <AppShell breadcrumb="Operación" title="Reservas">
      <ReservationsCalendar />
    </AppShell>
  );
}
