import type { Metadata } from "next";

import { TicketsView } from "./tickets-view";

export const metadata: Metadata = {
  title: "Tickets de atención · Mesa CRM",
  description:
    "Casos y reportes de atención al cliente: incidencias, consultas, devoluciones y seguimiento, por estado y prioridad.",
  openGraph: {
    title: "Tickets de atención · Mesa CRM",
    description: "Bandeja de soporte al cliente, independiente de los pedidos.",
  },
};

export default function TicketsPage() {
  return <TicketsView />;
}
