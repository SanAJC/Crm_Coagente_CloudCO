import type { Metadata } from "next";

import { PedidosView } from "./pedidos-view";

export const metadata: Metadata = {
  title: "Pedidos · Mesa CRM",
  description:
    "Tablero de pedidos por estado: nuevo, en cocina, servido y cerrado, con detalle de productos.",
  openGraph: {
    title: "Pedidos · Mesa CRM",
    description: "Seguimiento de pedidos del restaurante por estado y canal.",
  },
};

export default function PedidosPage() {
  return <PedidosView />;
}
