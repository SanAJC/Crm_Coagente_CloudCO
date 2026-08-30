import type { Metadata } from "next";

import { PedidosView } from "./pedidos-view";

export const metadata: Metadata = {
  title: "Pedidos y tickets · Mesa CRM",
  description:
    "Tablero de tickets por estado: nuevo, en cocina, servido y cerrado, con detalle de productos.",
  openGraph: {
    title: "Pedidos y tickets · Mesa CRM",
    description: "Seguimiento de pedidos del restaurante por estado y canal.",
  },
};

export default function PedidosPage() {
  return <PedidosView />;
}
