"use client";

import Link from "next/link";
import {
  CalendarDays,
  CircleDollarSign,
  LifeBuoy,
  Receipt,
  UtensilsCrossed,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReservationsCalendar } from "@/components/reservations-calendar";
import { currency, orderStageLabels, orderTotal, todayISO } from "@/lib/crm-data";
import { useCrm } from "@/lib/crm-store";

export function DashboardView() {
  const { reservations, orders, supportTickets, products } = useCrm();

  const todays = reservations.filter((r) => r.date === todayISO && r.status !== "cancelada");
  const guests = todays.reduce((sum, r) => sum + r.people, 0);
  const openOrders = orders.filter((o) => o.stage !== "cerrado");
  const sales = orders.reduce((sum, o) => sum + orderTotal(o), 0);
  const openTickets = supportTickets.filter((t) => t.status !== "cerrado");
  const urgentTickets = supportTickets.filter(
    (t) => t.status !== "cerrado" && t.priority === "urgente",
  );
  const outOfStock = products.filter((p) => !p.available || p.stock === 0);

  const kpis = [
    {
      label: "Reservas hoy",
      value: String(todays.length),
      hint: `${todays.filter((r) => r.status === "confirmada").length} confirmadas`,
      icon: CalendarDays,
    },
    {
      label: "Comensales esperados",
      value: String(guests),
      hint: "Incluye mesas en curso",
      icon: Users,
    },
    {
      label: "Pedidos abiertos",
      value: String(openOrders.length),
      hint: `${orders.filter((o) => o.stage === "cocina").length} en cocina`,
      icon: Receipt,
    },
    {
      label: "Tickets de atención",
      value: String(openTickets.length),
      hint: `${urgentTickets.length} urgentes`,
      icon: LifeBuoy,
    },
    {
      label: "Ventas del turno",
      value: currency(sales),
      hint: "Demo acumulada",
      icon: CircleDollarSign,
    },
  ];

  return (
    <AppShell
      breadcrumb="Operación"
      title="Resumen del servicio"
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/reservas">Ver agenda</Link>
          </Button>
          <Button asChild>
            <Link href="/pedidos">Crear pedido</Link>
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="panel p-5">
            <div className="flex items-start justify-between rounded-none">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{kpi.label}</p>
              <kpi.icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-3xl font-medium">{kpi.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:h-[640px] lg:grid-cols-3">
        <section className="flex min-h-0 flex-col lg:col-span-2">
          <ReservationsCalendar showTitle={false} lockToDay fill />
        </section>

        <section className="panel flex min-h-0 flex-col p-5">
          <h2 className="text-lg font-medium">Pedidos en curso</h2>
          <ul className="mt-4 min-h-0 flex-1 space-y-4 overflow-auto pr-1">
            {openOrders.map((order) => (
              <li key={order.id}>
                <article className="ticket-card border border-border">
                  <div className="space-y-2 p-3">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      <span>{order.channel}</span>
                      <span className="h-px flex-1 border-t border-dashed border-border" />
                      <UtensilsCrossed className="size-3 text-foreground" />
                    </div>
                    <div className="flex items-end justify-between gap-2">
                      <p className="font-display text-lg font-medium leading-none tracking-tight">
                        {order.code}
                      </p>
                      <p className="font-display text-sm font-medium leading-none tabular-nums">
                        {currency(orderTotal(order))}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-md bg-accent px-2 py-1.5 text-accent-foreground">
                      <span className="text-[10px] uppercase tracking-wider opacity-70">
                        {order.createdAt.slice(11, 16)}
                      </span>
                      <span className="text-[11px] font-medium">
                        {order.items.reduce((sum, item) => sum + item.qty, 0)} ítems
                      </span>
                      <Badge variant="outline">{orderStageLabels[order.stage]}</Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="space-y-1.5 px-3 pb-3 pt-2">
                    {order.items.map((item) => {
                      const product = products.find((p) => p.id === item.productId);
                      return (
                        <div key={item.productId} className="flex gap-2 text-xs">
                          <span className="font-medium tabular-nums">{item.qty}x</span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{item.name}</p>
                            <p className="truncate text-muted-foreground">{product?.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              </li>
            ))}
            {openOrders.length === 0 ? (
              <li className="text-sm text-muted-foreground">Sin pedidos abiertos.</li>
            ) : null}
          </ul>
        </section>
      </div>

      <section className="panel mt-6 p-5">
        <h2 className="text-lg font-medium">Atención en el menú</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Platos sin stock o desactivados que conviene revisar antes del turno de noche.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {outOfStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todo el menú está disponible.</p>
          ) : (
            outOfStock.map((product) => (
              <Badge key={product.id} variant="destructive">
                {product.name}
              </Badge>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}
