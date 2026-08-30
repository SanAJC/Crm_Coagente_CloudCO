import type { Metadata } from "next";

import { ProductsView } from "./productos-view";

export const metadata: Metadata = {
  title: "Catálogo de productos · Mesa CRM",
  description:
    "Crea, edita y desactiva platos y bebidas del menú con precio, stock y disponibilidad.",
  openGraph: {
    title: "Catálogo de productos · Mesa CRM",
    description: "Gestión del menú: precios, stock y disponibilidad por plato.",
  },
};

export default function ProductosPage() {
  return <ProductsView />;
}
