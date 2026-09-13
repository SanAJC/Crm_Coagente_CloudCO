"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Clock, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  getConfiguracion,
  listMesas,
  createMesa,
  deleteMesa,
  updateConfiguracion,
  type ConfiguracionNegocio,
  type UpdateConfiguracionInput,
} from "@/api/settings.api";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  permissionLabels,
  permissions,
  roleLabels,
  roles,
  weekdayLabels,
  type Role,
  type TeamMember,
} from "@/lib/crm-data";
import { newId, useCrm } from "@/lib/crm-store";
import { cn } from "@/lib/utils";

const intervalOptions = [15, 30, 45, 60];
const bufferOptions = [0, 10, 15, 20, 30];

const emptyMember = (): TeamMember => ({
  id: newId(),
  name: "",
  email: "",
  role: "Mesero",
  active: true,
});

function errorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error) && typeof error.response?.data?.message === "string") {
    return error.response.data.message as string;
  }
  return fallback;
}

function CalendarSettingsPanel() {
  const queryClient = useQueryClient();
  const configQuery = useQuery({ queryKey: ["configuracion-negocio"], queryFn: getConfiguracion });
  const mesasQuery = useQuery({ queryKey: ["mesas-todas"], queryFn: () => listMesas() });
  const [draft, setDraft] = useState<UpdateConfiguracionInput | null>(null);
  const [loadedConfig, setLoadedConfig] = useState<ConfiguracionNegocio | null>(null);
  const [newTable, setNewTable] = useState("");

  if (configQuery.data && configQuery.data !== loadedConfig) {
    const c = configQuery.data;
    setLoadedConfig(c);
    setDraft({
      horaApertura: c.horaApertura,
      horaCierre: c.horaCierre,
      intervaloMinutos: c.intervaloMinutos,
      bufferMinutos: c.bufferMinutos,
      tamanoMaximoGrupo: c.tamanoMaximoGrupo,
      diasCerrados: c.diasCerrados,
    });
  }

  const invalidarMesas = () => {
    queryClient.invalidateQueries({ queryKey: ["mesas-todas"] });
    queryClient.invalidateQueries({ queryKey: ["mesas"] });
  };

  const guardarMutation = useMutation({
    mutationFn: (dto: UpdateConfiguracionInput) => updateConfiguracion(dto),
    onSuccess: (config: ConfiguracionNegocio) => {
      queryClient.setQueryData(["configuracion-negocio"], config);
      toast.success("Configuración del calendario actualizada");
    },
    onError: (error) => toast.error(errorMessage(error, "No se pudo actualizar la configuración")),
  });

  const crearMesaMutation = useMutation({
    mutationFn: (nombre: string) => createMesa(nombre),
    onSuccess: () => {
      invalidarMesas();
      setNewTable("");
      toast.success("Mesa agregada");
    },
    onError: (error) => toast.error(errorMessage(error, "No se pudo agregar la mesa")),
  });

  const quitarMesaMutation = useMutation({
    mutationFn: (id: number) => deleteMesa(id),
    onSuccess: () => {
      invalidarMesas();
      toast.success("Mesa quitada");
    },
    onError: (error) => toast.error(errorMessage(error, "No se pudo quitar la mesa")),
  });

  const toggleDay = (day: number) => {
    setDraft((current) => {
      if (!current) return current;
      const dias = current.diasCerrados ?? [];
      return {
        ...current,
        diasCerrados: dias.includes(day) ? dias.filter((d) => d !== day) : [...dias, day],
      };
    });
  };

  const mesasActivas = (mesasQuery.data ?? []).filter((m) => m.activa);

  if (!draft) {
    return <div className="panel p-6 text-sm text-graphite">Cargando configuración…</div>;
  }

  return (
    <form
      className="panel space-y-6 p-6"
      onSubmit={(event) => {
        event.preventDefault();
        guardarMutation.mutate(draft);
      }}
    >
      <div>
        <h2 className="flex items-center gap-2 text-sm font-medium text-ink">
          <Clock className="size-4 text-iris-blue" /> Horario de atención
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="openTime">Apertura</Label>
            <Input
              id="openTime"
              type="time"
              value={draft.horaApertura}
              onChange={(event) => setDraft({ ...draft, horaApertura: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="closeTime">Cierre</Label>
            <Input
              id="closeTime"
              type="time"
              value={draft.horaCierre}
              onChange={(event) => setDraft({ ...draft, horaCierre: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Duración del turno</Label>
            <Select
              value={String(draft.intervaloMinutos)}
              onValueChange={(value) => setDraft({ ...draft, intervaloMinutos: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {intervalOptions.map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {value} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Buffer entre reservas</Label>
            <Select
              value={String(draft.bufferMinutos)}
              onValueChange={(value) => setDraft({ ...draft, bufferMinutos: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bufferOptions.map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {value === 0 ? "Sin buffer" : `${value} min`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxPartySize">Tamaño máximo de grupo</Label>
            <Input
              id="maxPartySize"
              type="number"
              min={1}
              value={draft.tamanoMaximoGrupo}
              onChange={(event) =>
                setDraft({ ...draft, tamanoMaximoGrupo: Number(event.target.value) })
              }
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-ink">Días de atención</h2>
        <p className="mt-1 text-xs text-graphite">
          Los días marcados en gris aparecerán como cerrados en la agenda.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {weekdayLabels.map((label, day) => {
            const closed = (draft.diasCerrados ?? []).includes(day);
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleDay(day)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  closed ? "bg-mist-gray text-fog" : "bg-mint-wash text-ink",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-ink">Mesas y zonas</h2>
        <p className="mt-1 text-xs text-graphite">
          Estas opciones alimentan el selector de mesa al crear una reserva o un pedido en físico.
          Se guardan al toque, no hace falta &quot;Guardar cambios&quot;.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {mesasActivas.map((mesa) => (
            <Badge key={mesa.id} variant="secondary" className="gap-1.5 py-1.5 pl-3 pr-2">
              {mesa.nombre}
              <button
                type="button"
                aria-label={`Quitar ${mesa.nombre}`}
                onClick={() => quitarMesaMutation.mutate(mesa.id)}
                className="rounded-full p-0.5 hover:bg-mist-gray"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          {mesasActivas.length === 0 ? (
            <p className="text-xs text-graphite">Todavía no hay mesas cargadas.</p>
          ) : null}
        </div>
        <div className="mt-3 flex max-w-sm gap-2">
          <Input
            placeholder="Nueva mesa o zona"
            value={newTable}
            onChange={(event) => setNewTable(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (newTable.trim()) crearMesaMutation.mutate(newTable.trim());
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={crearMesaMutation.isPending}
            onClick={() => newTable.trim() && crearMesaMutation.mutate(newTable.trim())}
          >
            <Plus className="size-4" /> Agregar
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={guardarMutation.isPending}>
          {guardarMutation.isPending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

function TeamPanel() {
  const { team, saveTeamMember, deleteTeamMember, rolePermissions, togglePermission } = useCrm();
  const [draft, setDraft] = useState<TeamMember | null>(null);
  const [isNew, setIsNew] = useState(false);

  return (
    <div className="space-y-6">
      <div className="panel p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink">Miembros del equipo</h2>
          <Button
            size="sm"
            onClick={() => {
              setDraft(emptyMember());
              setIsNew(true);
            }}
          >
            <Plus className="size-4" /> Nuevo usuario
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{member.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{roleLabels[member.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.active ? "secondary" : "outline"}>
                      {member.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Editar ${member.name}`}
                      onClick={() => {
                        setDraft({ ...member });
                        setIsNew(false);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Eliminar ${member.name}`}
                      onClick={() => {
                        deleteTeamMember(member.id);
                        toast.success("Usuario eliminado");
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="panel p-5">
        <h2 className="text-sm font-medium text-ink">Permisos por rol</h2>
        <p className="mt-1 text-xs text-graphite">
          El rol Administrador siempre tiene acceso completo al panel.
        </p>
        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Módulo</TableHead>
                {roles.map((role) => (
                  <TableHead key={role} className="text-center">
                    {roleLabels[role]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((permission) => (
                <TableRow key={permission}>
                  <TableCell className="font-medium">{permissionLabels[permission]}</TableCell>
                  {roles.map((role) => {
                    const isAdmin = role === "Administrador";
                    const checked = isAdmin || rolePermissions[role].includes(permission);
                    return (
                      <TableCell key={role} className="text-center">
                        <Checkbox
                          checked={checked}
                          disabled={isAdmin}
                          onCheckedChange={() => togglePermission(role, permission)}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNew ? "Nuevo usuario" : "Editar usuario"}</DialogTitle>
            <DialogDescription>
              Asigna un rol para definir a qué módulos tendrá acceso.
            </DialogDescription>
          </DialogHeader>
          {draft ? (
            <form
              id="member-form"
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!draft.name.trim() || !draft.email.trim()) return;
                saveTeamMember(draft);
                setDraft(null);
                toast.success(isNew ? "Usuario creado" : "Usuario actualizado");
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="member-name">Nombre</Label>
                <Input
                  id="member-name"
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-email">Correo</Label>
                <Input
                  id="member-email"
                  type="email"
                  value={draft.email}
                  onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={draft.role}
                  onValueChange={(value) => setDraft({ ...draft, role: value as Role })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {roleLabels[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Usuario activo</p>
                  <p className="text-xs text-muted-foreground">
                    Los usuarios inactivos no pueden iniciar sesión.
                  </p>
                </div>
                <Switch
                  checked={draft.active}
                  onCheckedChange={(checked) => setDraft({ ...draft, active: checked })}
                />
              </div>
            </form>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Cancelar
            </Button>
            <Button type="submit" form="member-form">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ConfiguracionView() {
  return (
    <AppShell breadcrumb="Sistema" title="Configuración">
      <Tabs defaultValue="calendario">
        <TabsList>
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios y roles</TabsTrigger>
        </TabsList>
        <TabsContent value="calendario" className="mt-4">
          <CalendarSettingsPanel />
        </TabsContent>
        <TabsContent value="usuarios" className="mt-4">
          <TeamPanel />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
