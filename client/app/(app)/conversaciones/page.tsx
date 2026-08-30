import type { Metadata } from "next";

import { ConversationsView } from "./conversaciones-view";

export const metadata: Metadata = {
  title: "Conversaciones omnicanal · Mesa CRM",
  description:
    "Bandeja unificada de WhatsApp, Telegram e Instagram con historial del cliente, sugerencias del agente de IA y acciones rápidas.",
  openGraph: {
    title: "Conversaciones omnicanal · Mesa CRM",
    description: "Gestiona los chats de tus clientes desde un solo lugar.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function ConversacionesPage() {
  return <ConversationsView />;
}
