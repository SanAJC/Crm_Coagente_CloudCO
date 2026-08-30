"use client";

import {
  ArrowLeft,
  Bot,
  Building2,
  CalendarClock,
  Check,
  CheckCheck,
  Clock,
  Instagram,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Send,
  ShoppingCart,
  Smile,
  Star,
  Tag,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  channelLabels,
  demoConversations,
  type ChatChannel,
  type Conversation,
} from "@/lib/chat-data";
import { cn } from "@/lib/utils";

const channelOrder: ChatChannel[] = ["whatsapp", "telegram", "instagram"];

const channelStyles: Record<ChatChannel, { dot: string; ring: string; soft: string }> = {
  whatsapp: { dot: "bg-success", ring: "ring-success/30", soft: "bg-success/10 text-success" },
  telegram: { dot: "bg-info", ring: "ring-info/30", soft: "bg-info/10 text-info" },
  instagram: { dot: "bg-primary", ring: "ring-primary/30", soft: "bg-primary/10 text-primary" },
};

const statusStyles: Record<Conversation["status"], string> = {
  "en línea": "text-success",
  esperando: "text-warning",
  resuelta: "text-muted-foreground",
};

const channelIcons: Record<ChatChannel, typeof MessageCircle> = {
  whatsapp: MessageCircle,
  telegram: Send,
  instagram: Instagram,
};

function useChannelStats(conversations: Conversation[]) {
  return useMemo(() => {
    const stats: Record<
      ChatChannel,
      { total: number; unread: number; online: number; waiting: number }
    > = {
      whatsapp: { total: 0, unread: 0, online: 0, waiting: 0 },
      telegram: { total: 0, unread: 0, online: 0, waiting: 0 },
      instagram: { total: 0, unread: 0, online: 0, waiting: 0 },
    };
    for (const c of conversations) {
      stats[c.channel].total += 1;
      stats[c.channel].unread += c.unread;
      if (c.status === "en línea") stats[c.channel].online += 1;
      if (c.status === "esperando") stats[c.channel].waiting += 1;
    }
    return stats;
  }, [conversations]);
}

function ChannelPortal({
  conversations,
  onSelect,
}: {
  conversations: Conversation[];
  onSelect: (channel: ChatChannel) => void;
}) {
  const stats = useChannelStats(conversations);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {channelOrder.map((channel) => {
        const Icon = channelIcons[channel];
        const s = stats[channel];
        return (
          <button
            key={channel}
            type="button"
            onClick={() => onSelect(channel)}
            className={cn(
              "group panel relative flex flex-col items-start gap-4 p-6 text-left transition-all",
              "hover:-translate-y-0.5 hover:shadow-soft hover:ring-1",
              channelStyles[channel].ring,
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span
                className={cn(
                  "flex size-12 items-center justify-center rounded-2xl",
                  channelStyles[channel].soft,
                )}
              >
                <Icon className="size-6" />
              </span>
              {s.unread > 0 ? (
                <Badge variant="secondary" className="tabular-nums">
                  {s.unread} sin leer
                </Badge>
              ) : (
                <Check className="size-5 text-muted-foreground" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium">{channelLabels[channel]}</h3>
              <p className="text-sm text-muted-foreground">
                {s.total} conversación{s.total === 1 ? "" : "es"} activa{s.total === 1 ? "" : "s"}
              </p>
            </div>

            <div className="mt-2 grid w-full grid-cols-3 gap-2 border-t border-border pt-4">
              <div className="text-center">
                <p className="font-display text-xl font-medium">{s.total}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="font-display text-xl font-medium text-success">{s.online}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  En línea
                </p>
              </div>
              <div className="text-center">
                <p className="font-display text-xl font-medium text-warning">{s.waiting}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Esperando
                </p>
              </div>
            </div>

            <span
              className={cn(
                "absolute inset-x-6 bottom-0 h-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100",
                channelStyles[channel].dot,
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export function ConversationsView() {
  const [conversations, setConversations] = useState(demoConversations);
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [activeId, setActiveId] = useState(demoConversations[0]!.id);
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState("");
  const composer = useRef<HTMLTextAreaElement>(null);

  const active = conversations.find((c) => c.id === activeId)!;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter(
      (c) =>
        (!selectedChannel || c.channel === selectedChannel) &&
        (!q || c.name.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q)),
    );
  }, [conversations, query, selectedChannel]);

  const kpis = [
    {
      label: "Conversaciones activas",
      value: String(conversations.filter((c) => c.status !== "resuelta").length),
      icon: MessageCircle,
    },
    {
      label: "Resueltas hoy",
      value: String(conversations.filter((c) => c.status === "resuelta").length + 12),
      icon: CheckCheck,
    },
    { label: "Tiempo promedio", value: "2m 35s", icon: Clock },
    { label: "Satisfacción", value: "96%", icon: Smile },
  ];

  const send = (text: string, from: "agente" | "equipo" = "equipo") => {
    const value = text.trim();
    if (!value) return;
    setConversations((list) =>
      list.map((c) =>
        c.id === activeId
          ? {
              ...c,
              unread: 0,
              preview: value,
              lastTime: new Date().toTimeString().slice(0, 5),
              messages: [
                ...c.messages,
                {
                  id: Math.random().toString(36).slice(2, 9),
                  from,
                  text: value,
                  time: new Date().toTimeString().slice(0, 5),
                },
              ],
            }
          : c,
      ),
    );
    setReply("");
    composer.current?.focus();
  };

  return (
    <AppShell
      breadcrumb="Agente de IA"
      title={selectedChannel ? channelLabels[selectedChannel] : "Conversaciones"}
      actions={
        <span className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
          <span className="size-2 animate-pulse rounded-full bg-success" /> IA conectada
        </span>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
          <ChannelPortal conversations={conversations} onSelect={setSelectedChannel} />
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

          <div className="mt-4 grid gap-4 lg:h-[680px] lg:grid-cols-[280px_minmax(0,1fr)_300px]">
            {/* Canales */}
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
              <div className="min-h-0 flex-1 space-y-4 overflow-auto pr-1">
                {channelOrder
                  .filter((channel) => channel === selectedChannel)
                  .map((channel) => {
                    const items = filtered.filter((c) => c.channel === channel);
                    if (items.length === 0) return null;
                    const pending = items.reduce((sum, c) => sum + c.unread, 0);
                    return (
                      <div key={channel}>
                        <div className="flex items-center gap-2 px-1 pb-1.5">
                          <span className={cn("size-2 rounded-full", channelStyles[channel].dot)} />
                          <p className="text-sm font-medium">{channelLabels[channel]}</p>
                          {pending > 0 ? (
                            <Badge variant="secondary" className="ml-auto tabular-nums">
                              {pending}
                            </Badge>
                          ) : null}
                        </div>
                        <ul className="space-y-1">
                          {items.map((c) => (
                            <li key={c.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveId(c.id);
                                  setConversations((list) =>
                                    list.map((x) => (x.id === c.id ? { ...x, unread: 0 } : x)),
                                  );
                                }}
                                className={cn(
                                  "w-full rounded-lg border p-2.5 text-left transition-colors",
                                  c.id === activeId
                                    ? "border-primary/40 bg-accent"
                                    : "border-transparent hover:bg-secondary",
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                                    {c.name.replace("@", "").slice(0, 1).toUpperCase()}
                                  </span>
                                  <p className="min-w-0 flex-1 truncate text-sm font-medium">
                                    {c.name}
                                  </p>
                                  <span className="text-[10px] tabular-nums text-muted-foreground">
                                    {c.lastTime}
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                  <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                                    {c.preview}
                                  </p>
                                  {c.unread > 0 ? (
                                    <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                      {c.unread}
                                    </span>
                                  ) : (
                                    <Check className="size-3.5 text-muted-foreground" />
                                  )}
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                {filtered.length === 0 ? (
                  <p className="px-1 text-sm text-muted-foreground">Sin resultados.</p>
                ) : null}
              </div>
            </section>

            {/* Chat */}
            <section className="panel flex min-h-0 flex-col overflow-hidden">
              <header className="flex items-center gap-3 border-b border-border p-4">
                <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-medium">
                  {active.name.replace("@", "").slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{active.name}</p>
                  <p className={cn("text-xs capitalize", statusStyles[active.status])}>
                    {channelLabels[active.channel]} · {active.status}
                  </p>
                </div>
                <Button variant="ghost" size="icon" aria-label="Etiquetar">
                  <Tag className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Destacar">
                  <Star className="size-4" />
                </Button>
              </header>

              <div className="min-h-0 flex-1 space-y-3 overflow-auto bg-secondary/30 p-4">
                <p className="text-center text-[11px] font-medium text-muted-foreground">Hoy</p>
                {active.messages.map((message) => {
                  const mine = message.from !== "cliente";
                  return (
                    <div key={message.id} className={cn("flex gap-2", mine && "flex-row-reverse")}>
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-card text-xs font-medium text-muted-foreground">
                        {mine ? (
                          <Bot className="size-3.5" />
                        ) : (
                          active.name.replace("@", "").slice(0, 1)
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
                        <p className="whitespace-pre-line">{message.text}</p>
                        <p
                          className={cn(
                            "mt-1 text-[10px] tabular-nums",
                            mine ? "opacity-70" : "text-muted-foreground",
                          )}
                        >
                          {message.time} {message.from === "agente" ? "· IA" : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form
                className="border-t border-border p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  send(reply);
                }}
              >
                <Textarea
                  ref={composer}
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Escribe tu mensaje o usa la IA para responder…"
                  className="min-h-20 resize-none"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      send(reply);
                    }
                  }}
                />
                <div className="mt-2 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setReply(active.suggestion)}
                  >
                    <Bot className="size-4" /> Sugerir con IA
                  </Button>
                  <Button type="submit" size="sm">
                    <Send className="size-4" /> Enviar
                  </Button>
                </div>
              </form>
            </section>

            {/* Cliente + IA */}
            <aside className="flex min-h-0 flex-col gap-4 overflow-auto lg:pr-1">
              <section className="panel p-4">
                <h2 className="text-sm font-medium">Información del cliente</h2>
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-medium">
                    {active.name.replace("@", "").slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{active.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{active.handle}</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Phone className="size-3.5" /> {active.phone}
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="size-3.5" /> {active.email}
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="size-3.5" /> {active.city}
                  </li>
                  <li className="flex items-center gap-2">
                    <Building2 className="size-3.5" /> Cliente desde {active.since}
                  </li>
                  <li className="flex items-center gap-2">
                    <ShoppingCart className="size-3.5" /> {active.orders} pedidos
                  </li>
                  <li className="flex items-center gap-2">
                    <CalendarClock className="size-3.5" /> Último: {active.lastOrder}
                  </li>
                </ul>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {active.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </section>

              <section className="panel p-4">
                <h2 className="text-sm font-medium">Asistente de IA</h2>
                <div className="mt-3 rounded-lg border border-border bg-secondary/40 p-3">
                  <p className="text-xs font-medium text-primary">Sugerencia de respuesta</p>
                  <p className="mt-2 text-sm">{active.suggestion}</p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => send(active.suggestion, "agente")}
                    >
                      Usar respuesta
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setReply(active.suggestion)}
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              </section>

              <section className="panel p-4">
                <h2 className="text-sm font-medium">Acciones rápidas</h2>
                <div className="mt-3 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => toast.success("Ticket creado desde la conversación")}
                  >
                    <ShoppingCart className="size-4" /> Crear pedido
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => toast.success("Reserva registrada para el cliente")}
                  >
                    <CalendarClock className="size-4" /> Crear reserva
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => toast.success("Link de pago enviado por el canal")}
                  >
                    <Link2 className="size-4" /> Generar link de pago
                  </Button>
                </div>
              </section>
            </aside>
          </div>
        </>
      )}
    </AppShell>
  );
}
