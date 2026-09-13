"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { listCategorias } from "@/api/categorias.api";
import {
  createProducto,
  deleteProducto,
  listProductos,
  updateProducto,
  type CreateProductoInput,
  type EstadoProducto,
  type Producto,
} from "@/api/products.api";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { currency } from "@/lib/crm-data";

const estadoLabels: Record<EstadoProducto, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  descontinuado: "Descontinuado",
};

type Draft = CreateProductoInput & { id?: number; estado: EstadoProducto };

function emptyDraft(): Draft {
  return {
    sku: "",
    nombre: "",
    categoriaId: undefined,
    precio: 0,
    costo: 0,
    stockActual: 0,
    stockMinimo: 0,
    descripcion: "",
    estado: "activo",
  };
}

function draftFromProducto(p: Producto): Draft {
  return {
    id: p.id,
    sku: p.sku,
    nombre: p.nombre,
    categoriaId: p.categoriaId ?? undefined,
    precio: p.precio,
    costo: p.costo ?? 0,
    stockActual: p.stockActual,
    stockMinimo: p.stockMinimo,
    descripcion: p.descripcion ?? "",
    estado: p.estado,
  };
}

function errorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error) && typeof error.response?.data?.message === "string") {
    return error.response.data.message as string;
  }
  return fallback;
}

export function ProductsView() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | "todas">("todas");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isNew, setIsNew] = useState(false);

  const productosQuery = useQuery({ queryKey: ["productos"], queryFn: () => listProductos() });
  const categoriasQuery = useQuery({ queryKey: ["categorias"], queryFn: listCategorias });

  const categorias = categoriasQuery.data ?? [];

  const crearMutation = useMutation({
    mutationFn: (dto: CreateProductoInput) => createProducto(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      setDraft(null);
      toast.success("Producto creado");
    },
    onError: (error) => toast.error(errorMessage(error, "No se pudo crear el producto")),
  });

  const actualizarMutation = useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: number;
      dto: CreateProductoInput & { estado: EstadoProducto };
    }) => updateProducto(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      setDraft(null);
      toast.success("Producto actualizado");
    },
    onError: (error) => toast.error(errorMessage(error, "No se pudo actualizar el producto")),
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => deleteProducto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      toast.success("Producto marcado como descontinuado");
    },
    onError: (error) => toast.error(errorMessage(error, "No se pudo eliminar el producto")),
  });

  const filtered = useMemo(
    () =>
      (productosQuery.data ?? []).filter(
        (p) =>
          (categoriaFiltro === "todas" || p.categoriaId === categoriaFiltro) &&
          p.nombre.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [productosQuery.data, query, categoriaFiltro],
  );

  const guardando = crearMutation.isPending || actualizarMutation.isPending;

  return (
    <AppShell
      breadcrumb="Catálogo"
      title="Productos"
      actions={
        <Button
          onClick={() => {
            setDraft(emptyDraft());
            setIsNew(true);
          }}
        >
          <Plus className="size-4" /> Nuevo producto
        </Button>
      }
    >
      <div className="panel p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar producto"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Select
            value={String(categoriaFiltro)}
            onValueChange={(value) =>
              setCategoriaFiltro(value === "todas" ? "todas" : Number(value))
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las categorías</SelectItem>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productosQuery.isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Cargando productos…
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <p className="font-medium">{product.nombre}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {product.categoria?.nombre ?? "Sin categoría"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {currency(product.precio)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{product.stockActual}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.estado === "activo" && product.stockActual > 0
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {product.estado === "activo" && product.stockActual === 0
                          ? "Agotado"
                          : estadoLabels[product.estado]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar ${product.nombre}`}
                        onClick={() => {
                          setDraft(draftFromProducto(product));
                          setIsNew(false);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Eliminar ${product.nombre}`}
                        onClick={() => eliminarMutation.mutate(product.id)}
                        disabled={eliminarMutation.isPending}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!productosQuery.isLoading && filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No encontramos productos con esos filtros.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNew ? "Nuevo producto" : "Editar producto"}</DialogTitle>
            <DialogDescription>
              Los cambios se guardan directo en el catálogo real.
            </DialogDescription>
          </DialogHeader>
          {draft ? (
            <form
              id="product-form"
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!draft.nombre.trim() || !draft.sku.trim()) return;

                const dto: CreateProductoInput & { estado: EstadoProducto } = {
                  sku: draft.sku.trim(),
                  nombre: draft.nombre.trim(),
                  descripcion: draft.descripcion || undefined,
                  categoriaId: draft.categoriaId,
                  precio: draft.precio,
                  costo: draft.costo,
                  stockActual: draft.stockActual,
                  stockMinimo: draft.stockMinimo,
                  estado: draft.estado,
                };

                if (isNew) {
                  crearMutation.mutate(dto);
                } else if (draft.id !== undefined) {
                  actualizarMutation.mutate({ id: draft.id, dto });
                }
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={draft.sku}
                    onChange={(event) => setDraft({ ...draft, sku: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={draft.nombre}
                    onChange={(event) => setDraft({ ...draft, nombre: event.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select
                    value={draft.categoriaId ? String(draft.categoriaId) : "sin_categoria"}
                    onValueChange={(value) =>
                      setDraft({
                        ...draft,
                        categoriaId: value === "sin_categoria" ? undefined : Number(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sin_categoria">Sin categoría</SelectItem>
                      {categorias.map((c) => (
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
                      setDraft({ ...draft, estado: value as EstadoProducto })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(estadoLabels) as EstadoProducto[]).map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estadoLabels[estado]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="price">Precio (COP)</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    value={draft.precio}
                    onChange={(event) => setDraft({ ...draft, precio: Number(event.target.value) })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="costo">Costo (COP)</Label>
                  <Input
                    id="costo"
                    type="number"
                    min={0}
                    value={draft.costo}
                    onChange={(event) => setDraft({ ...draft, costo: Number(event.target.value) })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min={0}
                    value={draft.stockActual}
                    onChange={(event) =>
                      setDraft({ ...draft, stockActual: Number(event.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="stockMinimo">Stock mínimo</Label>
                  <Input
                    id="stockMinimo"
                    type="number"
                    min={0}
                    value={draft.stockMinimo}
                    onChange={(event) =>
                      setDraft({ ...draft, stockMinimo: Number(event.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={draft.descripcion}
                  onChange={(event) => setDraft({ ...draft, descripcion: event.target.value })}
                />
              </div>
            </form>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Cancelar
            </Button>
            <Button type="submit" form="product-form" disabled={guardando}>
              {guardando ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
