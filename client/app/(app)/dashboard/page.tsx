import type { Metadata } from "next";

import { DashboardView } from "./dashboard-view";

export const metadata: Metadata = {
  title: "Resumen del servicio · Mesa CRM",
  description:
    "Indicadores del día: reservas confirmadas, comensales esperados, tickets abiertos y ventas del turno.",
  openGraph: {
    title: "Resumen del servicio · Mesa CRM",
    description: "Panel operativo con reservas, tickets y ventas del turno.",
  },
};

export default function DashboardPage() {
  return <DashboardView />;
}
