import type { Metadata } from "next";

import { LoginView } from "./login-view";

export const metadata: Metadata = {
  title: "Ingresar · Mesa CRM para restaurantes",
  description:
    "Accede a Mesa CRM para gestionar reservas, pedidos y el catálogo de tu restaurante en un solo panel.",
  openGraph: {
    title: "Ingresar · Mesa CRM",
    description: "Panel de reservas, pedidos y productos para restaurantes.",
  },
};

export default function LoginPage() {
  return <LoginView />;
}
