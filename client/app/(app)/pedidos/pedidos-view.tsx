"use client";

import { ArrowRight, Minus, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  currency,
  orderStageLabels,
  orderTotal,
  type Order,
  type OrderStage,
} from "@/lib/crm-data";
import { newId, useCrm } from "@/lib/crm-store";

const stages: OrderStage[] = ["nuevo", "cocina", "servido", "cerrado"];
const channels: Order["channel"][] = ["Salón", "Delivery", "Agente IA", "Teléfono"];

const stageDot: Record<OrderStage, string> = {
  nuevo: "bg-warning",
  cocina: "bg-info",
  servido: "bg-success",
  cerrado: "bg-muted-foreground",
};

const nextStage = (stage: OrderStage) =>
  stages[Math.min(stages.indexOf(stage) + 1, stages.length - 1)]!;

const emptyOrder = (): Order => ({
  id: newId(),
  code: `PED-${Math.floor(2050 + Math.random() * 900)}`,
  customer: "",
  channel: "Salón",
  stage: "nuevo",
  createdAt: new Date().toISOString().slice(0, 16),
  items: [],
  note: "",
});

export function PedidosView() {
  const { orders, products, saveOrder, moveOrder, deleteOrder } = useCrm();
  const [draft, setDraft] = useState<Order | null>(null);
  const [isNew, setIsNew] = useState(false);

  const addItem = (productId: string) => {
    if (!draft) return;
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const existing = draft.items.find((item) => item.productId === productId);
    setDraft({
      ...draft,
      items: existing
        ? draft.items.map((item) =>
            item.productId === productId ? { ...item, qty: item.qty + 1 } : item,
          )
        : [...draft.items, { productId, name: product.name, qty: 1, price: product.price }],
    });
  };

  const changeQty = (productId: string, delta: number) => {
    if (!draft) return;
    setDraft({
      ...draft,
      items: draft.items
        .map((item) => (item.productId === productId ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0),
    });
  };

  return (
    <AppShell
      breadcrumb="Operación"
      title="Pedidos"
      actions={
        <Button
          onClick={() => {
            setDraft(emptyOrder());
            setIsNew(true);
          }}
        >
          <Plus className="size-4" /> Crear pedido
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-4">
        {stages.map((stage) => {
          const column = orders.filter((order) => order.stage === stage);
          return (
            <section key={stage} className="panel flex flex-col gap-3 bg-secondary/40 p-3">
              <header className="flex items-center gap-2 px-1">
                <span className={`size-2 rounded-full ${stageDot[stage]}`} />
                <h2 className="text-sm font-medium">{orderStageLabels[stage]}</h2>
                <span className="text-xs text-muted-foreground">{column.length}</span>
              </header>

              {column.map((order) => (
                <article key={order.id} className="ticket-card">
                  <div className="space-y-3 p-4">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      <span>Canal</span>
                      <span className="h-px flex-1 border-t border-dashed border-border" />
                      <UtensilsCrossed className="size-3.5 text-foreground" />
                      <span className="h-px flex-1 border-t border-dashed border-border" />
                      <span>Estado</span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <button
                          type="button"
                          className="font-display text-2xl font-medium leading-none tracking-tight hover:text-primary"
                          onClick={() => {
                            setDraft({ ...order, items: order.items.map((i) => ({ ...i })) });
                            setIsNew(false);
                          }}
                        >
                          {order.code}
                        </button>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {order.channel}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg font-medium leading-none tabular-nums">
                          {currency(orderTotal(order))}
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className={`size-1.5 rounded-full ${stageDot[order.stage]}`} />
                          {orderStageLabels[order.stage]}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-accent px-3 py-2 text-accent-foreground">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider opacity-70">Hora</p>
                        <p className="text-sm font-medium tabular-nums">
                          {order.createdAt.slice(11, 16)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider opacity-70">Ítems</p>
                        <p className="text-sm font-medium tabular-nums">
                          {order.items.reduce((sum, item) => sum + item.qty, 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider opacity-70">Mesa</p>
                        <p className="truncate text-sm font-medium">
                          {order.customer.split("·")[0]?.trim() || "—"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Cliente
                      </p>
                      <p className="truncate text-sm font-medium">{order.customer}</p>
                    </div>

                    <ul className="space-y-1">
                      {order.items.map((item) => (
                        <li key={item.productId} className="flex justify-between text-xs">
                          <span className="truncate pr-2">
                            {item.qty}× {item.name}
                          </span>
                          <span className="tabular-nums text-muted-foreground">
                            {currency(item.qty * item.price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="ticket-notch border-t border-dashed border-border" />

                  <div className="flex items-center justify-between gap-2 p-4 pt-3">
                    <span className="barcode h-9 flex-1 opacity-80" aria-hidden="true" />
                    {order.stage === "cerrado" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Eliminar ${order.code}`}
                        onClick={() => {
                          deleteOrder(order.id);
                          toast.success("Pedido eliminado");
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveOrder(order.id, nextStage(order.stage))}
                      >
                        {orderStageLabels[nextStage(order.stage)]}
                        <ArrowRight className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </article>
              ))}

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => {
                  setDraft({ ...emptyOrder(), stage });
                  setIsNew(true);
                }}
              >
                <Plus className="size-3.5" /> Añadir
              </Button>
            </section>
          );
        })}
      </div>

      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "Crear pedido" : `Pedido ${draft?.code}`}</DialogTitle>
            <DialogDescription>
              Selecciona productos del catálogo y define el canal de venta.
            </DialogDescription>
          </DialogHeader>
          {draft ? (
            <form
              id="order-form"
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!draft.customer.trim() || draft.items.length === 0) {
                  toast.error("Agrega el cliente y al menos un producto");
                  return;
                }
                saveOrder(draft);
                setDraft(null);
                toast.success(isNew ? "Pedido creado" : "Pedido actualizado");
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer">Cliente / mesa</Label>
                  <Input
                    id="customer"
                    value={draft.customer}
                    onChange={(event) => setDraft({ ...draft, customer: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Canal</Label>
                  <Select
                    value={draft.channel}
                    onValueChange={(value) =>
                      setDraft({ ...draft, channel: value as Order["channel"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.map((channel) => (
                        <SelectItem key={channel} value={channel}>
                          {channel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={draft.stage}
                    onValueChange={(value) => setDraft({ ...draft, stage: value as OrderStage })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {orderStageLabels[stage]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Agregar producto</Label>
                  <Select value="" onValueChange={addItem}>
                    <SelectTrigger>
                      <SelectValue placeholder="Elegir del menú" />
                    </SelectTrigger>
                    <SelectContent>
                      {products
                        .filter((product) => product.available)
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} · {currency(product.price)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border border-border">
                {draft.items.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">Aún no hay productos.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {draft.items.map((item) => (
                      <li key={item.productId} className="flex items-center gap-3 p-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {currency(item.price)} c/u
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="Quitar unidad"
                            onClick={() => changeQty(item.productId, -1)}
                          >
                            <Minus className="size-3.5" />
                          </Button>
                          <span className="w-8 text-center text-sm tabular-nums">{item.qty}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="Agregar unidad"
                            onClick={() => changeQty(item.productId, 1)}
                          >
                            <Plus className="size-3.5" />
                          </Button>
                        </div>
                        <span className="w-24 text-right text-sm font-medium tabular-nums">
                          {currency(item.qty * item.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center justify-between border-t border-border p-3">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-base font-medium tabular-nums">
                    {currency(orderTotal(draft))}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order-note">Nota para cocina</Label>
                <Textarea
                  id="order-note"
                  value={draft.note}
                  onChange={(event) => setDraft({ ...draft, note: event.target.value })}
                />
              </div>
            </form>
          ) : null}
          <DialogFooter className="sm:justify-between">
            {!isNew && draft ? (
              <Button
                variant="ghost"
                onClick={() => {
                  deleteOrder(draft.id);
                  setDraft(null);
                  toast.success("Ticket eliminado");
                }}
              >
                <Trash2 className="size-4" /> Eliminar
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDraft(null)}>
                Cancelar
              </Button>
              <Button type="submit" form="order-form">
                Guardar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
