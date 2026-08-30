"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ChefHat,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  Receipt,
  Settings,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import type { ReactNode } from "react";

import { IconField } from "@/components/icon-field";
import { Button } from "@/components/ui/button";
import { useCrm } from "@/lib/crm-store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { to: "/conversaciones", label: "Conversaciones", icon: MessagesSquare },
  { to: "/reservas", label: "Reservas", icon: CalendarDays },
  { to: "/pedidos", label: "Pedidos / Tickets", icon: Receipt },
  { to: "/productos", label: "Productos", icon: UtensilsCrossed },
  { to: "/configuracion", label: "Configuración", icon: Settings },
] as const;

export function AppShell({
  title,
  breadcrumb,
  actions,
  children,
}: {
  title: string;
  breadcrumb: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { user, signOut } = useCrm();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      <IconField />

      <aside className="sticky top-0 z-10 hidden h-screen w-[248px] shrink-0 flex-col bg-sidebar px-3 py-5 md:flex">
        <div className="flex items-center gap-2.5 px-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-button)]">
            <ChefHat className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-medium text-sidebar-foreground">
              Mesa CRM
            </p>
            <p className="truncate text-[11px] text-fog">Casa Aurora</p>
          </div>
        </div>

        <nav className="mt-7 space-y-1">
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-full px-3.5 py-2 text-sm font-medium tracking-[-0.01em] transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-graphite hover:bg-mist-gray hover:text-sidebar-foreground",
                )}
              >
                <item.icon className={cn("size-[18px]", active && "text-iris-blue")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="rounded-3xl bg-lavender-wash p-4">
            <p className="flex items-center gap-2 text-xs font-medium text-ink">
              <Sparkles className="size-3.5 text-iris-blue" /> Agente IA
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-graphite">
              Listo para conectar: tomará reservas y pedidos por WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-2.5 border-t border-sidebar-border px-2 pt-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-charcoal text-xs font-medium text-white">
              {user?.name.slice(0, 1) ?? "?"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-ink">{user?.name ?? "Invitado"}</p>
              <p className="truncate text-[11px] text-fog">{user?.email ?? ""}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full text-fog"
              onClick={() => {
                signOut();
                router.replace("/login");
              }}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 bg-background/90 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 px-8 py-5">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-fog">
                {breadcrumb}
              </p>
              <h1 className="mt-1 truncate font-display text-[26px] font-medium tracking-[-0.02em] text-ink">
                {title}
              </h1>
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-3 md:hidden">
            {nav.map((item) => (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  "whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium",
                  pathname.startsWith(item.to)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 px-8 py-7">{children}</main>
      </div>
    </div>
  );
}
