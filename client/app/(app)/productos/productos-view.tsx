"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { currency, type Product } from "@/lib/crm-data";
import { newId, useCrm } from "@/lib/crm-store";

const categories: Product["category"][] = ["Entrantes", "Principales", "Postres", "Bebidas"];

const emptyProduct = (): Product => ({
  id: newId(),
  name: "",
  category: "Principales",
  price: 0,
  stock: 0,
  available: true,
  description: "",
});

export function ProductsView() {
  const { products, saveProduct, deleteProduct } = useCrm();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"todas" | Product["category"]>("todas");
  const [draft, setDraft] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);

  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (category === "todas" || product.category === category) &&
          product.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [products, query, category],
  );

  return (
    <AppShell
      breadcrumb="Catálogo"
      title="Productos"
      actions={
        <Button
          onClick={() => {
            setDraft(emptyProduct());
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
              placeholder="Buscar plato o bebida"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Select value={category} onValueChange={(value) => setCategory(value as typeof category)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las categorías</SelectItem>
              {categories.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
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
              {filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <p className="font-medium">{product.name}</p>
                    <p className="max-w-sm truncate text-xs text-muted-foreground">
                      {product.description}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.category}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {currency(product.price)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{product.stock}</TableCell>
                  <TableCell>
                    <Badge
                      variant={product.available && product.stock > 0 ? "secondary" : "destructive"}
                    >
                      {product.available && product.stock > 0 ? "Disponible" : "Agotado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Editar ${product.name}`}
                      onClick={() => {
                        setDraft({ ...product });
                        setIsNew(false);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Eliminar ${product.name}`}
                      onClick={() => {
                        deleteProduct(product.id);
                        toast.success("Producto eliminado");
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 ? (
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
              Los cambios se aplican al catálogo de demostración de este panel.
            </DialogDescription>
          </DialogHeader>
          {draft ? (
            <form
              id="product-form"
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!draft.name.trim()) return;
                saveProduct(draft);
                setDraft(null);
                toast.success(isNew ? "Producto creado" : "Producto actualizado");
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-1">
                  <Label>Categoría</Label>
                  <Select
                    value={draft.category}
                    onValueChange={(value) =>
                      setDraft({ ...draft, category: value as Product["category"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Precio (COP)</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    value={draft.price}
                    onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min={0}
                    value={draft.stock}
                    onChange={(event) => setDraft({ ...draft, stock: Number(event.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Disponible en carta</p>
                  <p className="text-xs text-muted-foreground">
                    Se oculta del menú si lo desactivas.
                  </p>
                </div>
                <Switch
                  checked={draft.available}
                  onCheckedChange={(checked) => setDraft({ ...draft, available: checked })}
                />
              </div>
            </form>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Cancelar
            </Button>
            <Button type="submit" form="product-form">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
