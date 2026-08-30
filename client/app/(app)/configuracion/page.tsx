import type { Metadata } from "next";

import { ConfiguracionView } from "./configuracion-view";

export const metadata: Metadata = {
  title: "Configuración · Mesa CRM",
  description: "Configura el horario del calendario, las mesas disponibles y los roles del equipo.",
  openGraph: {
    title: "Configuración · Mesa CRM",
    description: "Horario del calendario, mesas y gestión de usuarios y roles.",
  },
};

export default function ConfiguracionPage() {
  return <ConfiguracionView />;
}
