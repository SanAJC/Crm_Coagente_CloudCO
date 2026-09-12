"use client";

import {
  ArrowLeft,
  Bot,
  Check,
  Instagram,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Send,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  enviarMensaje,
  listConversaciones,
  listMensajes,
  updateConversacion,
  type Canal,
  type Conversacion,
  type EstadoConversacion,
  type Mensaje,
} from "@/api/messages.api";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";

const channelOrder: Canal[] = ["whatsapp", "telegram", "instagram"];

const channelLabels: Record<Canal, string> = {
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  instagram: "Instagram",
};

const channelCardStyles: Record<Canal, { gradient: string; text: string }> = {
  whatsapp: { gradient: "bg-gradient-to-br from-success to-mint-wash", text: "text-white" },
  telegram: { gradient: "bg-gradient-to-br from-iris-blue to-sky-blue", text: "text-white" },
  instagram: { gradient: "bg-gradient-to-br from-chart-4 to-peach-wash", text: "text-white" },
};

const channelIcons: Record<Canal, typeof MessageCircle> = {
  whatsapp: MessageCircle,
  telegram: Send,
  instagram: Instagram,
};

const estadoLabels: Record<EstadoConversacion, string> = {
  abierta: "Abierta",
  cerrada: "Cerrada",
  archivada: "Archivada",
};

const estadoStyles: Record<EstadoConversacion, string> = {
  abierta: "text-success",
  cerrada: "text-muted-foreground",
  archivada: "text-warning",
};

function formatHora(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

function nombreConversacion(c: Conversacion) {
  return c.cliente?.nombre ?? c.canalChatId;
}

function inicial(nombre: string) {
  return nombre.replace("@", "").slice(0, 1).toUpperCase();
}

export function ConversationsView() {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [mensajesPorConversacion, setMensajesPorConversacion] = useState<Record<number, Mensaje[]>>(
    {},
  );
  const [selectedChannel, setSelectedChannel] = useState<Canal | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState("");
  const [sinLeer, setSinLeer] = useState<Set<number>>(new Set());
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const composer = useRef<HTMLTextAreaElement>(null);
  const activeIdRef = useRef<number | null>(null);
  const loadedConversationsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const cargarMensajes = useCallback((id: number) => {
    if (loadedConversationsRef.current.has(id)) return;
    loadedConversationsRef.current.add(id);
    setCargandoMensajes(true);
    listMensajes(id)
      .then((mensajes) => {
        setMensajesPorConversacion((current) => ({ ...current, [id]: mensajes }));
      })
      .catch(() => {
        toast.error("No se pudieron cargar los mensajes");
        loadedConversationsRef.current.delete(id);
      })
      .finally(() => setCargandoMensajes(false));
  }, []);

  const abrirConversacion = useCallback(
    (id: number) => {
      setActiveId(id);
      setSinLeer((prev) => {
        if (!prev.has(id)) return prev;
        const siguiente = new Set(prev);
        siguiente.delete(id);
        return siguiente;
      });
      getSocket().emit("conversacion:unirse", id);
      cargarMensajes(id);
    },
    [cargarMensajes],
  );

  useEffect(() => {
    listConversaciones()
      .then((data) => {
        setConversaciones(data);
        const primera = data[0];
        if (primera) abrirConversacion(primera.id);
      })
      .catch(() => toast.error("No se pudieron cargar las conversaciones"));
  }, [abrirConversacion]);

  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    function onMensajeNuevo({
      conversacionId,
      mensaje,
    }: {
      conversacionId: number;
      mensaje: Mensaje;
    }) {
      setMensajesPorConversacion((prev) => {
        const actuales = prev[conversacionId] ?? [];
        if (actuales.some((m) => m.id === mensaje.id)) return prev;
        return { ...prev, [conversacionId]: [...actuales, mensaje] };
      });
      if (activeIdRef.current !== conversacionId) {
        setSinLeer((prev) => new Set(prev).add(conversacionId));
      }
    }

    function onConversacionActualizada(conversacion: Conversacion) {
      setConversaciones((prev) => {
        const existe = prev.some((c) => c.id === conversacion.id);
        const siguiente = existe
          ? prev.map((c) => (c.id === conversacion.id ? conversacion : c))
          : [conversacion, ...prev];
        return [...siguiente].sort((a, b) => {
          const fa = a.ultimoMensajeAt ? new Date(a.ultimoMensajeAt).getTime() : 0;
          const fb = b.ultimoMensajeAt ? new Date(b.ultimoMensajeAt).getTime() : 0;
          return fb - fa;
        });
      });
    }

    socket.on("mensaje:nuevo", onMensajeNuevo);
    socket.on("conversacion:actualizada", onConversacionActualizada);

    return () => {
      socket.off("mensaje:nuevo", onMensajeNuevo);
      socket.off("conversacion:actualizada", onConversacionActualizada);
      socket.disconnect();
    };
  }, []);

  const active = conversaciones.find((c) => c.id === activeId) ?? null;
  const mensajesActivos = activeId !== null ? (mensajesPorConversacion[activeId] ?? []) : [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversaciones.filter(
      (c) =>
        (!selectedChannel || c.canal === selectedChannel) &&
        (!q ||
          nombreConversacion(c).toLowerCase().includes(q) ||
          c.canalChatId.toLowerCase().includes(q)),
    );
  }, [conversaciones, query, selectedChannel]);

  const stats = useMemo(() => {
    const base: Record<Canal, { total: number; abiertas: number; sinLeer: number }> = {
      whatsapp: { total: 0, abiertas: 0, sinLeer: 0 },
      telegram: { total: 0, abiertas: 0, sinLeer: 0 },
      instagram: { total: 0, abiertas: 0, sinLeer: 0 },
    };
    for (const c of conversaciones) {
      base[c.canal].total += 1;
      if (c.estado === "abierta") base[c.canal].abiertas += 1;
      if (sinLeer.has(c.id)) base[c.canal].sinLeer += 1;
    }
    return base;
  }, [conversaciones, sinLeer]);

  const kpis = [
    { label: "Conversaciones", value: String(conversaciones.length), icon: MessageCircle },
    {
      label: "Abiertas",
      value: String(conversaciones.filter((c) => c.estado === "abierta").length),
      icon: Check,
    },
    { label: "Sin leer", value: String(sinLeer.size), icon: Bot },
  ];

  const enviar = async () => {
    const contenido = reply.trim();
    if (!contenido || activeId === null || enviando) return;
    setEnviando(true);
    try {
      await enviarMensaje(activeId, { tipoContenido: "texto", contenido });
      setReply("");
      composer.current?.focus();
    } catch {
      toast.error("No se pudo enviar el mensaje");
    } finally {
      setEnviando(false);
    }
  };

  const cambiarEstado = async (estado: EstadoConversacion) => {
    if (activeId === null) return;
    try {
      await updateConversacion(activeId, { estado });
    } catch {
      toast.error("No se pudo actualizar el estado de la conversación");
    }
  };

  return (
    <AppShell
      breadcrumb="Agente de IA"
      title={selectedChannel ? channelLabels[selectedChannel] : "Conversaciones"}
      actions={
        <span className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
          <span className="size-2 animate-pulse rounded-full bg-success" /> Conectado en vivo
        </span>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="panel flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="mt-1 font-display text-2xl font-medium">{kpi.value}</p>
            </div>
            <kpi.icon className="size-5 text-muted-foreground" />
          </div>
        ))}
      </div>

      {!selectedChannel ? (
        <div className="mt-4">
          <h2 className="mb-4 text-base font-medium">Selecciona un canal para atender</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {channelOrder.map((channel) => {
              const Icon = channelIcons[channel];
              const s = stats[channel];
              const style = channelCardStyles[channel];
              return (
                <button
                  key={channel}
                  type="button"
                  onClick={() => setSelectedChannel(channel)}
                  className={cn(
                    "group relative flex flex-col items-start gap-4 overflow-hidden rounded-[var(--radius-sm)] p-6 text-left transition-all",
                    "hover:-translate-y-0.5 hover:shadow-soft hover:ring-2 hover:ring-white/50",
                    style.gradient,
                    style.text,
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1.25}
                    className="pointer-events-none absolute inset-y-0 right-0 h-full w-auto translate-x-1/4 rotate-12 opacity-15"
                  />

                  <div className="relative flex w-full items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15">
                      <Icon className="size-6" />
                    </span>
                    {s.sinLeer > 0 ? (
                      <Badge variant="secondary" className="bg-white/20 text-white tabular-nums">
                        {s.sinLeer} sin leer
                      </Badge>
                    ) : (
                      <Check className="size-5 opacity-70" />
                    )}
                  </div>

                  <div className="relative">
                    <h3 className="text-lg font-medium">{channelLabels[channel]}</h3>
                    <p className="text-sm opacity-80">
                      {s.total} conversación{s.total === 1 ? "" : "es"}
                    </p>
                  </div>

                  <div className="relative mt-2 grid w-full grid-cols-2 gap-2 border-t border-white/20 pt-4">
                    <div className="text-center">
                      <p className="font-display text-xl font-medium">{s.total}</p>
                      <p className="text-[10px] uppercase tracking-wide opacity-70">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="font-display text-xl font-medium">{s.abiertas}</p>
                      <p className="text-[10px] uppercase tracking-wide opacity-70">Abiertas</p>
                    </div>
                  </div>

                  <span className="absolute inset-x-6 bottom-0 h-1 rounded-full bg-white/0 opacity-0 transition-opacity group-hover:bg-white/70 group-hover:opacity-100" />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedChannel(null)}
              className="gap-1"
            >
              <ArrowLeft className="size-4" /> Volver a canales
            </Button>
          </div>

          <div className="mt-4 grid gap-4 lg:h-[680px] lg:grid-cols-[280px_minmax(0,1fr)_280px]">
            <section className="panel flex min-h-0 flex-col p-3">
              <div className="flex items-center gap-2 px-1 pb-2">
                <h2 className="text-sm font-medium">{channelLabels[selectedChannel]}</h2>
                <Search className="ml-auto size-4 text-muted-foreground" />
              </div>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar cliente"
                className="mb-2"
              />
              <div className="min-h-0 flex-1 space-y-1 overflow-auto pr-1">
                {filtered
                  .filter((c) => c.canal === selectedChannel)
                  .map((c) => {
                    const nombre = nombreConversacion(c);
                    const preview = (mensajesPorConversacion[c.id] ?? []).at(-1)?.contenido;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => abrirConversacion(c.id)}
                        className={cn(
                          "w-full rounded-lg border p-2.5 text-left transition-colors",
                          c.id === activeId
                            ? "border-primary/40 bg-accent"
                            : "border-transparent hover:bg-secondary",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                            {inicial(nombre)}
                          </span>
                          <p className="min-w-0 flex-1 truncate text-sm font-medium">{nombre}</p>
                          <span className="text-[10px] tabular-nums text-muted-foreground">
                            {formatHora(c.ultimoMensajeAt)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                            {preview ?? "Sin mensajes"}
                          </p>
                          {sinLeer.has(c.id) ? (
                            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                              •
                            </span>
                          ) : (
                            <Check className="size-3.5 text-muted-foreground" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                {filtered.filter((c) => c.canal === selectedChannel).length === 0 ? (
                  <p className="px-1 text-sm text-muted-foreground">Sin conversaciones.</p>
                ) : null}
              </div>
            </section>

            <section className="panel flex min-h-0 flex-col overflow-hidden">
              {active ? (
                <>
                  <header className="flex items-center gap-3 border-b border-border p-4">
                    <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-medium">
                      {inicial(nombreConversacion(active))}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{nombreConversacion(active)}</p>
                      <p className={cn("text-xs capitalize", estadoStyles[active.estado])}>
                        {channelLabels[active.canal]} · {estadoLabels[active.estado]}
                      </p>
                    </div>
                    <Select value={active.estado} onValueChange={cambiarEstado}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(estadoLabels) as EstadoConversacion[]).map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estadoLabels[estado]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </header>

                  <div className="min-h-0 flex-1 space-y-3 overflow-auto bg-secondary/30 p-4">
                    {cargandoMensajes && mensajesActivos.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground">Cargando…</p>
                    ) : mensajesActivos.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground">
                        Todavía no hay mensajes en esta conversación.
                      </p>
                    ) : (
                      mensajesActivos.map((mensaje) => {
                        const mine = mensaje.remitente !== "cliente";
                        return (
                          <div
                            key={mensaje.id}
                            className={cn("flex gap-2", mine && "flex-row-reverse")}
                          >
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-card text-xs font-medium text-muted-foreground">
                              {mine ? (
                                <Bot className="size-3.5" />
                              ) : (
                                inicial(nombreConversacion(active))
                              )}
                            </span>
                            <div
                              className={cn(
                                "max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-soft",
                                mine
                                  ? "rounded-tr-sm bg-primary text-primary-foreground"
                                  : "rounded-tl-sm bg-card text-card-foreground",
                              )}
                            >
                              <p className="whitespace-pre-line">
                                {mensaje.contenido ?? `[${mensaje.tipoContenido}]`}
                              </p>
                              <p
                                className={cn(
                                  "mt-1 text-[10px] tabular-nums",
                                  mine ? "opacity-70" : "text-muted-foreground",
                                )}
                              >
                                {formatHora(mensaje.createdAt)}
                                {mensaje.remitente === "agente" ? " · agente" : ""}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form
                    className="border-t border-border p-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void enviar();
                    }}
                  >
                    <Textarea
                      ref={composer}
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      placeholder="Escribe tu mensaje…"
                      className="min-h-20 resize-none"
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void enviar();
                        }
                      }}
                    />
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <Button type="submit" size="sm" disabled={enviando}>
                        <Send className="size-4" /> {enviando ? "Enviando…" : "Enviar"}
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                  Selecciona una conversación
                </div>
              )}
            </section>

            <aside className="flex min-h-0 flex-col gap-4 overflow-auto lg:pr-1">
              {active ? (
                <section className="panel p-4">
                  <h2 className="text-sm font-medium">Información del cliente</h2>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-medium">
                      {inicial(nombreConversacion(active))}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{nombreConversacion(active)}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {channelLabels[active.canal]} · {active.canalChatId}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Phone className="size-3.5" /> {active.cliente?.telefono ?? "Sin registrar"}
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="size-3.5" /> {active.cliente?.email ?? "Sin registrar"}
                    </li>
                  </ul>
                  {!active.cliente ? (
                    <p className="mt-3 rounded-lg border border-dashed border-border p-2 text-xs text-muted-foreground">
                      Esta conversación todavía no está vinculada a un cliente registrado.
                    </p>
                  ) : null}
                  {active.ticketId ? (
                    <div className="mt-3 rounded-lg border border-border bg-secondary/40 p-2 text-xs">
                      Vinculada al ticket #{active.ticketId}
                    </div>
                  ) : null}
                </section>
              ) : null}
            </aside>
          </div>
        </>
      )}
    </AppShell>
  );
}
