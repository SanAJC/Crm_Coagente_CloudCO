"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  defaultCalendarSettings,
  defaultRolePermissions,
  demoOrders,
  demoProducts,
  demoReservations,
  demoSupportTickets,
  demoTeam,
  type CalendarSettings,
  type Order,
  type OrderStage,
  type PermissionKey,
  type Product,
  type Reservation,
  type Role,
  type RolePermissions,
  type SupportTicket,
  type TeamMember,
  type TicketStatus,
} from "./crm-data";

export type SessionUser = { name: string; email: string; role: string };

const SESSION_KEY = "mesa-crm-session";

type CrmContextValue = {
  user: SessionUser | null;
  hydrated: boolean;
  signIn: (email: string) => SessionUser;
  signOut: () => void;
  products: Product[];
  reservations: Reservation[];
  orders: Order[];
  supportTickets: SupportTicket[];
  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  saveReservation: (reservation: Reservation) => void;
  deleteReservation: (id: string) => void;
  saveOrder: (order: Order) => void;
  moveOrder: (id: string, stage: OrderStage) => void;
  deleteOrder: (id: string) => void;
  saveSupportTicket: (ticket: SupportTicket) => void;
  moveSupportTicket: (id: string, status: TicketStatus) => void;
  deleteSupportTicket: (id: string) => void;
  calendarSettings: CalendarSettings;
  saveCalendarSettings: (settings: CalendarSettings) => void;
  team: TeamMember[];
  saveTeamMember: (member: TeamMember) => void;
  deleteTeamMember: (id: string) => void;
  rolePermissions: RolePermissions;
  togglePermission: (role: Role, permission: PermissionKey) => void;
};

const CrmContext = createContext<CrmContextValue | null>(null);

export const newId = () => Math.random().toString(36).slice(2, 10);

function upsert<T extends { id: string }>(list: T[], item: T) {
  return list.some((entry) => entry.id === item.id)
    ? list.map((entry) => (entry.id === item.id ? item : entry))
    : [item, ...list];
}

export function CrmProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [reservations, setReservations] = useState<Reservation[]>(demoReservations);
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(demoSupportTickets);
  const [calendarSettings, setCalendarSettings] =
    useState<CalendarSettings>(defaultCalendarSettings);
  const [team, setTeam] = useState<TeamMember[]>(demoTeam);
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>(defaultRolePermissions);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      // One-shot hydration of a persisted demo session on mount; there's no
      // external-store subscription to sync against, just a single read.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setUser(JSON.parse(raw) as SessionUser);
    } catch {
      // ignore corrupted demo session
    }
    setHydrated(true);
  }, []);

  const signIn = useCallback((email: string) => {
    const handle = email.split("@")[0]?.replace(/[._-]+/g, " ") || "Equipo";
    const session: SessionUser = {
      name: handle.replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role: "Administrador",
    };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const value = useMemo<CrmContextValue>(
    () => ({
      user,
      hydrated,
      signIn,
      signOut,
      products,
      reservations,
      orders,
      supportTickets,
      saveProduct: (product) => setProducts((list) => upsert(list, product)),
      deleteProduct: (id) => setProducts((list) => list.filter((p) => p.id !== id)),
      saveReservation: (reservation) => setReservations((list) => upsert(list, reservation)),
      deleteReservation: (id) => setReservations((list) => list.filter((r) => r.id !== id)),
      saveOrder: (order) => setOrders((list) => upsert(list, order)),
      moveOrder: (id, stage) =>
        setOrders((list) => list.map((o) => (o.id === id ? { ...o, stage } : o))),
      deleteOrder: (id) => setOrders((list) => list.filter((o) => o.id !== id)),
      saveSupportTicket: (ticket) => setSupportTickets((list) => upsert(list, ticket)),
      moveSupportTicket: (id, status) =>
        setSupportTickets((list) =>
          list.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  resolvedAt:
                    status === "resuelto" || status === "cerrado"
                      ? (t.resolvedAt ?? new Date().toISOString().slice(0, 16))
                      : t.resolvedAt,
                }
              : t,
          ),
        ),
      deleteSupportTicket: (id) => setSupportTickets((list) => list.filter((t) => t.id !== id)),
      calendarSettings,
      saveCalendarSettings: (settings) => setCalendarSettings(settings),
      team,
      saveTeamMember: (member) => setTeam((list) => upsert(list, member)),
      deleteTeamMember: (id) => setTeam((list) => list.filter((m) => m.id !== id)),
      rolePermissions,
      togglePermission: (role, permission) =>
        setRolePermissions((current) => {
          const granted = current[role].includes(permission);
          return {
            ...current,
            [role]: granted
              ? current[role].filter((p) => p !== permission)
              : [...current[role], permission],
          };
        }),
    }),
    [
      user,
      hydrated,
      signIn,
      signOut,
      products,
      reservations,
      orders,
      supportTickets,
      calendarSettings,
      team,
      rolePermissions,
    ],
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error("useCrm must be used inside CrmProvider");
  return ctx;
}
