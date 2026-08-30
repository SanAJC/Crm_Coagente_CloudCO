import type { Metadata } from "next";

import { ReservasView } from "./reservas-view";

export const metadata: Metadata = {
  title: "Agenda de reservas · Mesa CRM",
  description:
    "Agenda por franjas horarias para confirmar, sentar o cancelar reservas del restaurante.",
  openGraph: {
    title: "Agenda de reservas · Mesa CRM",
    description: "Vista de agenda por horas con estado de cada reserva.",
  },
};

export default function ReservasPage() {
  return <ReservasView />;
}
