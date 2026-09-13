"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { ArrowRight, Minus, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { listClientes } from "@/api/clientes.api";
import {
  addItem,
  cancelPedido,
  createPedido,
  listPedidos,
  removeItem,
  updateItem,
  updatePedido,
  type EstadoPedido,
  type Pedido,
} from "@/api/pedidos.api";
import { listProductos } from "@/api/products.api";
import { listMesas } from "@/api/settings.api";
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
import { currency } from "@/lib/crm-data";

const estados: EstadoPedido[] = ["pendiente", "en_proceso", "enviado", "entregado", "cancelado"];
const progresion: EstadoPedido[] = ["pendiente", "en_proceso", "enviado", "entregado"];

const estadoLabels: Record<EstadoPedido, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const estadoDot: Record<EstadoPedido, string> = {
  pendiente: "bg-warning",
  en_proceso: "bg-info",
  enviado: "bg-info",
  entregado: "bg-success",
  cancelado: "bg-destructive",
};

function siguienteEstado(estado: EstadoPedido): EstadoPedido | null {
  const idx = progresion.indexOf(estado);
  if (idx === -1 || idx === progresion.length - 1) return null;
  return progresion[idx + 1] ?? null;
}

function errorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error) && typeof error.response?.data?.message === "string") {
    return error.response.data.message as string;
  }
  return fallback;
}

export function PedidosView() {
  const queryClient = useQueryClient();
  const [draftId, setDraftId] = useState<number | null>(null);
  const [creando, setCreando] = useState(false);
  const [clienteNuevo, setClienteNuevo] = useState<number | undefined>(undefined);
  const [direccionNueva, setDireccionNueva] = useState("");
  const [mesaNueva, setMesaNueva] = useState<number | undefined>(undefined);

  const pedidosQuery = useQuery({ queryKey: ["pedidos"], queryFn: () => listPedidos() });
  const clientesQuery = useQuery({ queryKey: ["clientes"], queryFn: listClientes });
  const productosQuery = useQuery({ queryKey: ["productos"], queryFn: () => listProductos() });
  const mesasQuery = useQuery({ queryKey: ["mesas"], queryFn: () => listMesas(true) });

  const clientes = clientesQuery.data ?? [];
  const mesas = mesasQuery.data ?? [];
  const productosDisponibles = (productosQuery.data ?? []).filter(
    (p) => p.estado === "activo" && p.stockActual > 0,
  );

  const draft: Pedido | null =
    draftId !== null ? ((pedidosQuery.data ?? []).find((p) => p.id === draftId) ?? null) : null;

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["pedidos"] });

  const crearMutation = useMutation({
    mutationFn: (dto: { clienteId: number; direccionEnvio?: string; mesaId?: number }) =>
      createPedido(dto),
    onSuccess: (pedido) => {
      invalidar();
      setCreando(false);
      setDraftId(pedido.id);
      toast.success("Pedido creado, ahora agregá los productos");
    },
    onError: (error) => toast.error(errorMessage(error, "No se pudo crear el pedido")),
  });

  const actualizarMutation = useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: number;
      dto: {
        clienteId?: number;
        direccionEnvio?: string;
        estado?: EstadoPedido;
        mesaId?: number;
      };
    }) => updatePedido(id, dto),
    onSuccess: invalidar,
    onError: (error) => toast.error(errorMessage(error, "No se pudo actualizar el pedido")),
  });

  const cancelarMutation = useMutation({
    mutationFn: (id: number) => cancelPedido(id),
    onSuccess: () => {
      invalidar();
      toast.success("Pedido cancelado");
    },
    onError: (error) => toast.error(errorMessage(error, "No se pudo cancelar el pedido")),
  });

  const agregarItemMutation = useMutation({
    mutationFn: ({ pedidoId, productoId }: { pedidoId: number; productoId: number }) =>
      addItem(pedidoId, { productoId, cantidad: 1 }),
    onSuccess: invalidar,
    onError: (error) => toast.error(errorMessage(error, "No se pudo agregar el producto")),
  });

  const actualizarItemMutation = useMutation({
    mutationFn: ({
      pedidoId,
      itemId,
      cantidad,
    }: {
      pedidoId: number;
      itemId: number;
      cantidad: number;
    }) => updateItem(pedidoId, itemId, { cantidad }),
    onSuccess: invalidar,
    onError: (error) => toast.error(errorMessage(error, "No se pudo actualizar la cantidad")),
  });

  const quitarItemMutation = useMutation({
    mutationFn: ({ pedidoId, itemId }: { pedidoId: number; itemId: number }) =>
      removeItem(pedidoId, itemId),
    onSuccess: invalidar,
    onError: (error) => toast.error(errorMessage(error, "No se pudo quitar el producto")),
  });

  const columnas = useMemo(() => {
    const base: Record<EstadoPedido, Pedido[]> = {
      pendiente: [],
      en_proceso: [],
      enviado: [],
      entregado: [],
      cancelado: [],
    };
    for (const pedido of pedidosQuery.data ?? []) {
      base[pedido.estado].push(pedido);
    }
    return base;
  }, [pedidosQuery.data]);

  const cambiarCantidad = (item: { id: number; cantidad: number }, delta: number) => {
    if (!draft) return;
    const nueva = item.cantidad + delta;
    if (nueva <= 0) {
      quitarItemMutation.mutate({ pedidoId: draft.id, itemId: item.id });
    } else {
      actualizarItemMutation.mutate({ pedidoId: draft.id, itemId: item.id, cantidad: nueva });
    }
  };

  return (
    <AppShell
      breadcrumb="Operación"
      title="Pedidos"
      actions={
        <Button
          onClick={() => {
            setCreando(true);
            setClienteNuevo(undefined);
            setDireccionNueva("");
            setMesaNueva(undefined);
          }}
        >
          <Plus className="size-4" /> Crear pedido
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-5">
        {estados.map((estado) => {
          const columna = columnas[estado];
          return (
            <section key={estado} className="panel flex flex-col gap-3 bg-secondary/40 p-3">
              <header className="flex items-center gap-2 px-1">
                <span className={`size-2 rounded-full ${estadoDot[estado]}`} />
                <h2 className="text-sm font-medium">{estadoLabels[estado]}</h2>
                <span className="text-xs text-muted-foreground">{columna.length}</span>
              </header>

              {pedidosQuery.isLoading ? (
                <p className="px-1 text-xs text-muted-foreground">Cargando…</p>
              ) : (
                columna.map((pedido) => {
                  const totalItems = pedido.items.reduce((sum, i) => sum + i.cantidad, 0);
                  const siguiente = siguienteEstado(pedido.estado);
                  return (
                    <article key={pedido.id} className="ticket-card">
                      <div className="space-y-3 p-4">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          <span>Pedido</span>
                          <span className="h-px flex-1 border-t border-dashed border-border" />
                          <UtensilsCrossed className="size-3.5 text-foreground" />
                        </div>

                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            className="font-display text-2xl font-medium leading-none tracking-tight hover:text-primary"
                            onClick={() => setDraftId(pedido.id)}
                          >
                            PED-{pedido.id}
                          </button>
                          <div className="text-right">
                            <p className="font-display text-lg font-medium leading-none tabular-nums">
                              {currency(pedido.total)}
                            </p>
                            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span
                                className={`size-1.5 rounded-full ${estadoDot[pedido.estado]}`}
                              />
                              {estadoLabels[pedido.estado]}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 rounded-lg bg-accent px-3 py-2 text-accent-foreground">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider opacity-70">Hora</p>
                            <p className="text-sm font-medium tabular-nums">
                              {new Date(pedido.fechaPedido).toLocaleTimeString("es-CO", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider opacity-70">Ítems</p>
                            <p className="text-sm font-medium tabular-nums">{totalItems}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider opacity-70">
                              Cliente
                            </p>
                            <p className="truncate text-sm font-medium">{pedido.cliente.nombre}</p>
                          </div>
                        </div>

                        {pedido.mesa ? (
                          <p className="text-xs text-muted-foreground">
                            Mesa: {pedido.mesa.nombre}
                          </p>
                        ) : null}

                        <ul className="space-y-1">
                          {pedido.items.map((item) => (
                            <li key={item.id} className="flex justify-between text-xs">
                              <span className="truncate pr-2">
                                {item.cantidad}× {item.producto.nombre}
                              </span>
                              <span className="tabular-nums text-muted-foreground">
                                {currency(item.subtotal)}
                              </span>
                            </li>
                          ))}
                          {pedido.items.length === 0 ? (
                            <li className="text-xs text-muted-foreground">Sin productos aún.</li>
                          ) : null}
                        </ul>
                      </div>

                      <div className="ticket-notch border-t border-dashed border-border" />

                      <div className="flex items-center justify-between gap-2 p-4 pt-3">
                        <span className="barcode h-9 flex-1 opacity-80" aria-hidden="true" />
                        {pedido.estado !== "cancelado" && pedido.estado !== "entregado" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Cancelar PED-${pedido.id}`}
                            onClick={() => cancelarMutation.mutate(pedido.id)}
                            disabled={cancelarMutation.isPending}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        ) : (
                          <span />
                        )}
                        {siguiente ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              actualizarMutation.mutate({
                                id: pedido.id,
                                dto: { estado: siguiente },
                              })
                            }
                          >
                            {estadoLabels[siguiente]}
                            <ArrowRight className="size-3.5" />
                          </Button>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              )}
            </section>
          );
        })}
      </div>

      {/* Crear pedido: paso 1, la cabecera */}
      <Dialog open={creando} onOpenChange={(open) => !open && setCreando(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear pedido</DialogTitle>
            <DialogDescription>
              Elegí el cliente primero; después de crearlo vas a poder agregar productos.
            </DialogDescription>
          </DialogHeader>
          <form
            id="new-order-form"
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (clienteNuevo === undefined) {
                toast.error("Elegí un cliente");
                return;
              }
              crearMutation.mutate({
                clienteId: clienteNuevo,
                direccionEnvio: direccionNueva || undefined,
                mesaId: mesaNueva,
              });
            }}
          >
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={clienteNuevo !== undefined ? String(clienteNuevo) : ""}
                onValueChange={(value) => setClienteNuevo(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Elegir cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {clientes.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No hay clientes registrados todavía.
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Mesa (opcional, para clientes en físico)</Label>
              <Select
                value={mesaNueva !== undefined ? String(mesaNueva) : "none"}
                onValueChange={(value) =>
                  setMesaNueva(value === "none" ? undefined : Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin mesa (delivery / agente)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin mesa (delivery / agente)</SelectItem>
                  {mesas.map((mesa) => (
                    <SelectItem key={mesa.id} value={String(mesa.id)}>
                      {mesa.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección de envío (opcional)</Label>
              <Input
                id="direccion"
                value={direccionNueva}
                onChange={(event) => setDireccionNueva(event.target.value)}
              />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreando(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="new-order-form" disabled={crearMutation.isPending}>
              {crearMutation.isPending ? "Creando…" : "Crear pedido"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editar pedido existente: cabecera + items en vivo */}
      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraftId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft ? `Pedido PED-${draft.id}` : ""}</DialogTitle>
            <DialogDescription>Cambios en el pedido se guardan al toque.</DialogDescription>
          </DialogHeader>
          {draft ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select
                    value={String(draft.clienteId)}
                    onValueChange={(value) =>
                      actualizarMutation.mutate({ id: draft.id, dto: { clienteId: Number(value) } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={draft.estado}
                    onValueChange={(value) =>
                      actualizarMutation.mutate({
                        id: draft.id,
                        dto: { estado: value as EstadoPedido },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estadoLabels[estado]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mesa</Label>
                  <Select
                    value={
                      draft.mesaId !== undefined && draft.mesaId !== null
                        ? String(draft.mesaId)
                        : "none"
                    }
                    onValueChange={(value) =>
                      actualizarMutation.mutate({
                        id: draft.id,
                        dto: { mesaId: value === "none" ? undefined : Number(value) },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sin mesa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin mesa (delivery / agente)</SelectItem>
                      {mesas.map((mesa) => (
                        <SelectItem key={mesa.id} value={String(mesa.id)}>
                          {mesa.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="direccion-edit">Dirección de envío</Label>
                  <Input
                    id="direccion-edit"
                    defaultValue={draft.direccionEnvio ?? ""}
                    onBlur={(event) =>
                      actualizarMutation.mutate({
                        id: draft.id,
                        dto: { direccionEnvio: event.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Agregar producto</Label>
                  <Select
                    value=""
                    onValueChange={(value) =>
                      agregarItemMutation.mutate({ pedidoId: draft.id, productoId: Number(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Elegir del catálogo" />
                    </SelectTrigger>
                    <SelectContent>
                      {productosDisponibles.map((producto) => (
                        <SelectItem key={producto.id} value={String(producto.id)}>
                          {producto.nombre} · {currency(producto.precio)}
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
                      <li key={item.id} className="flex items-center gap-3 p-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.producto.nombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {currency(item.precioUnitario)} c/u
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="Quitar unidad"
                            onClick={() => cambiarCantidad(item, -1)}
                          >
                            <Minus className="size-3.5" />
                          </Button>
                          <span className="w-8 text-center text-sm tabular-nums">
                            {item.cantidad}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="Agregar unidad"
                            onClick={() => cambiarCantidad(item, 1)}
                          >
                            <Plus className="size-3.5" />
                          </Button>
                        </div>
                        <span className="w-24 text-right text-sm font-medium tabular-nums">
                          {currency(item.subtotal)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center justify-between border-t border-border p-3">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-base font-medium tabular-nums">
                    {currency(draft.total)}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraftId(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
