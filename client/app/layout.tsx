import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";

import { Providers } from "./providers";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-geist",
  display: "swap",
});

const aeonik = Inter({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-aeonik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mesa CRM · Gestión de pedidos y reservas para restaurantes",
  description:
    "Mesa CRM centraliza reservas, pedidos y catálogo de tu restaurante en un solo panel conectado a un agente de IA.",
  authors: [{ name: "Mesa CRM" }],
  icons: { icon: "/logo.png" },
  openGraph: {
    title: "Mesa CRM · Gestión de pedidos y reservas para restaurantes",
    description:
      "Centraliza reservas, pedidos y catálogo de tu restaurante en un solo panel conectado a un agente de IA.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@MesaCRM",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${aeonik.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
