export type Product = {
  id: string;
  name: string;
  category: "Entrantes" | "Principales" | "Postres" | "Bebidas";
  price: number;
  stock: number;
  available: boolean;
  description: string;
};

export type ReservationStatus = "confirmada" | "pendiente" | "sentada" | "cancelada";

export type Reservation = {
  id: string;
  guest: string;
  phone: string;
  people: number;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  table: string;
  status: ReservationStatus;
  note: string;
};

export type OrderStage = "nuevo" | "cocina" | "servido" | "cerrado";

export type OrderItem = { productId: string; name: string; qty: number; price: number };

export type Order = {
  id: string;
  code: string;
  customer: string;
  channel: "Salón" | "Delivery" | "Agente IA" | "Teléfono";
  stage: OrderStage;
  createdAt: string;
  items: OrderItem[];
  note: string;
};

export type TicketType = "seguimiento" | "incidencia" | "consulta" | "devolucion";
export type TicketPriority = "baja" | "media" | "alta" | "urgente";
export type TicketStatus = "abierto" | "en_proceso" | "resuelto" | "cerrado";

export type SupportTicket = {
  id: string;
  code: string;
  subject: string;
  description: string;
  customer: string;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  orderId?: string;
  assignee?: string;
  createdAt: string;
  resolvedAt?: string;
};

export const demoProducts: Product[] = [
  {
    id: "p1",
    name: "Ceviche de la casa",
    category: "Entrantes",
    price: 32000,
    stock: 24,
    available: true,
    description: "Pesca del día, leche de tigre y camote glaseado.",
  },
  {
    id: "p2",
    name: "Burrata con tomate rostizado",
    category: "Entrantes",
    price: 28000,
    stock: 12,
    available: true,
    description: "Burrata fresca, albahaca y aceite de oliva ahumado.",
  },
  {
    id: "p3",
    name: "Risotto de hongos",
    category: "Principales",
    price: 46000,
    stock: 18,
    available: true,
    description: "Arroz carnaroli, portobello y parmesano curado 24 meses.",
  },
  {
    id: "p4",
    name: "Lomo al carbón 300g",
    category: "Principales",
    price: 72000,
    stock: 9,
    available: true,
    description: "Corte madurado, chimichurri de casa y papas rústicas.",
  },
  {
    id: "p5",
    name: "Salmón en costra de sésamo",
    category: "Principales",
    price: 68000,
    stock: 0,
    available: false,
    description: "Salmón fresco, puré de coliflor y cítricos.",
  },
  {
    id: "p6",
    name: "Tarta de maracuyá",
    category: "Postres",
    price: 19000,
    stock: 20,
    available: true,
    description: "Masa sablée, curd de maracuyá y merengue tostado.",
  },
  {
    id: "p7",
    name: "Limonada de coco",
    category: "Bebidas",
    price: 14000,
    stock: 40,
    available: true,
    description: "Limón, coco y hierbabuena fresca.",
  },
  {
    id: "p8",
    name: "Vino Malbec (copa)",
    category: "Bebidas",
    price: 24000,
    stock: 32,
    available: true,
    description: "Mendoza, notas de ciruela y vainilla.",
  },
];

const today = new Date();
const iso = (offsetDays = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

export const todayISO = iso(0);

export const demoReservations: Reservation[] = [
  {
    id: "r1",
    guest: "Camila Restrepo",
    phone: "+57 310 442 1180",
    people: 2,
    date: iso(0),
    time: "12:30",
    table: "Mesa 4",
    status: "confirmada",
    note: "Aniversario, mesa junto a la ventana.",
  },
  {
    id: "r2",
    guest: "Andrés Gómez",
    phone: "+57 300 118 7742",
    people: 4,
    date: iso(0),
    time: "13:00",
    table: "Mesa 9",
    status: "sentada",
    note: "Un comensal sin gluten.",
  },
  {
    id: "r3",
    guest: "Familia Vélez",
    phone: "+57 315 660 2231",
    people: 6,
    date: iso(0),
    time: "19:30",
    table: "Salón privado",
    status: "confirmada",
    note: "Silla para bebé.",
  },
  {
    id: "r4",
    guest: "Laura Mendoza",
    phone: "+57 312 774 5590",
    people: 3,
    date: iso(0),
    time: "20:00",
    table: "Mesa 2",
    status: "pendiente",
    note: "Reservó por el agente de IA.",
  },
  {
    id: "r5",
    guest: "Grupo Nexus",
    phone: "+57 601 442 0090",
    people: 10,
    date: iso(1),
    time: "13:30",
    table: "Terraza",
    status: "confirmada",
    note: "Almuerzo corporativo, factura a nombre de la empresa.",
  },
  {
    id: "r6",
    guest: "Julián Ortega",
    phone: "+57 318 220 4413",
    people: 2,
    date: iso(1),
    time: "20:30",
    table: "Barra",
    status: "pendiente",
    note: "Pidió maridaje de vinos.",
  },
  {
    id: "r7",
    guest: "Sofía Bermúdez",
    phone: "+57 320 555 7781",
    people: 5,
    date: iso(2),
    time: "19:00",
    table: "Mesa 11",
    status: "cancelada",
    note: "Canceló por viaje.",
  },
];

export const demoOrders: Order[] = [
  {
    id: "o1",
    code: "PED-2041",
    customer: "Mesa 4 · Camila R.",
    channel: "Salón",
    stage: "cocina",
    createdAt: `${iso(0)}T12:38`,
    items: [
      { productId: "p1", name: "Ceviche de la casa", qty: 1, price: 32000 },
      { productId: "p4", name: "Lomo al carbón 300g", qty: 2, price: 72000 },
    ],
    note: "Término medio en ambos cortes.",
  },
  {
    id: "o2",
    code: "PED-2042",
    customer: "Andrés Gómez",
    channel: "Delivery",
    stage: "nuevo",
    createdAt: `${iso(0)}T12:52`,
    items: [
      { productId: "p3", name: "Risotto de hongos", qty: 1, price: 46000 },
      { productId: "p7", name: "Limonada de coco", qty: 2, price: 14000 },
    ],
    note: "Entrega en portería, torre B.",
  },
  {
    id: "o3",
    code: "PED-2043",
    customer: "Laura Mendoza",
    channel: "Agente IA",
    stage: "nuevo",
    createdAt: `${iso(0)}T13:04`,
    items: [{ productId: "p2", name: "Burrata con tomate rostizado", qty: 2, price: 28000 }],
    note: "Pedido tomado por el agente en WhatsApp.",
  },
  {
    id: "o4",
    code: "PED-2039",
    customer: "Mesa 9 · Familia Vélez",
    channel: "Salón",
    stage: "servido",
    createdAt: `${iso(0)}T12:10`,
    items: [
      { productId: "p6", name: "Tarta de maracuyá", qty: 3, price: 19000 },
      { productId: "p8", name: "Vino Malbec (copa)", qty: 2, price: 24000 },
    ],
    note: "Postres al centro.",
  },
  {
    id: "o5",
    code: "PED-2036",
    customer: "Grupo Nexus",
    channel: "Teléfono",
    stage: "cerrado",
    createdAt: `${iso(0)}T11:20`,
    items: [{ productId: "p4", name: "Lomo al carbón 300g", qty: 4, price: 72000 }],
    note: "Pagado con tarjeta corporativa.",
  },
];

export const orderStageLabels: Record<OrderStage, string> = {
  nuevo: "Nuevo",
  cocina: "En cocina",
  servido: "Servido",
  cerrado: "Cerrado",
};

export const demoSupportTickets: SupportTicket[] = [
  {
    id: "st1",
    code: "TCK-1001",
    subject: "Pedido llegó incompleto",
    description:
      "Faltó el risotto de hongos en la entrega. Cliente molesto, pide reposición o descuento.",
    customer: "Andrés Gómez",
    type: "incidencia",
    priority: "alta",
    status: "abierto",
    orderId: "o2",
    createdAt: `${iso(0)}T13:20`,
  },
  {
    id: "st2",
    code: "TCK-1002",
    subject: "Consulta por alérgenos",
    description: "Pregunta si el risotto de hongos tiene lácteos, tiene un comensal intolerante.",
    customer: "Familia Vélez",
    type: "consulta",
    priority: "media",
    status: "en_proceso",
    assignee: "Valentina Ríos",
    createdAt: `${iso(0)}T11:45`,
  },
  {
    id: "st3",
    code: "TCK-1003",
    subject: "Reembolso por plato en mal estado",
    description:
      "El salmón llegó frío y con olor extraño. Cliente exige reembolso completo del plato.",
    customer: "Grupo Nexus",
    type: "devolucion",
    priority: "urgente",
    status: "abierto",
    orderId: "o5",
    createdAt: `${iso(0)}T14:05`,
  },
  {
    id: "st4",
    code: "TCK-1004",
    subject: "Confirmar llegada a evento corporativo",
    description: "Seguimiento post-servicio para confirmar satisfacción del almuerzo corporativo.",
    customer: "Grupo Nexus",
    type: "seguimiento",
    priority: "baja",
    status: "resuelto",
    assignee: "Camilo Duarte",
    createdAt: `${iso(-1)}T10:00`,
    resolvedAt: `${iso(-1)}T16:30`,
  },
  {
    id: "st5",
    code: "TCK-1005",
    subject: "Reserva no confirmada a tiempo por el agente IA",
    description:
      "El agente tomó la reserva pero el cliente nunca recibió la confirmación por WhatsApp.",
    customer: "Laura Mendoza",
    type: "incidencia",
    priority: "media",
    status: "cerrado",
    assignee: "Valentina Ríos",
    createdAt: `${iso(-2)}T09:15`,
    resolvedAt: `${iso(-2)}T09:50`,
  },
];

export const ticketTypeLabels: Record<TicketType, string> = {
  seguimiento: "Seguimiento",
  incidencia: "Incidencia",
  consulta: "Consulta",
  devolucion: "Devolución",
};

export const ticketPriorityLabels: Record<TicketPriority, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

export const ticketStatusLabels: Record<TicketStatus, string> = {
  abierto: "Abierto",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
};

export const statusLabels: Record<ReservationStatus, string> = {
  confirmada: "Confirmada",
  pendiente: "Pendiente",
  sentada: "En mesa",
  cancelada: "Cancelada",
};

export type Role = "Administrador" | "Gerente" | "Mesero" | "Cocina";

export const roles: Role[] = ["Administrador", "Gerente", "Mesero", "Cocina"];

export const roleLabels: Record<Role, string> = {
  Administrador: "Administrador",
  Gerente: "Gerente",
  Mesero: "Mesero",
  Cocina: "Cocina",
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

export const demoTeam: TeamMember[] = [
  {
    id: "u1",
    name: "Gerencia Casa Aurora",
    email: "gerencia@casaaurora.co",
    role: "Administrador",
    active: true,
  },
  {
    id: "u2",
    name: "Valentina Ríos",
    email: "valentina@casaaurora.co",
    role: "Gerente",
    active: true,
  },
  {
    id: "u3",
    name: "Camilo Duarte",
    email: "camilo@casaaurora.co",
    role: "Mesero",
    active: true,
  },
  {
    id: "u4",
    name: "Estación cocina",
    email: "cocina@casaaurora.co",
    role: "Cocina",
    active: false,
  },
];

export type PermissionKey =
  "reservas" | "pedidos" | "productos" | "tickets" | "conversaciones" | "configuracion";

export const permissions: PermissionKey[] = [
  "reservas",
  "pedidos",
  "productos",
  "tickets",
  "conversaciones",
  "configuracion",
];

export const permissionLabels: Record<PermissionKey, string> = {
  reservas: "Reservas",
  pedidos: "Pedidos",
  productos: "Productos",
  tickets: "Tickets de atención",
  conversaciones: "Conversaciones",
  configuracion: "Configuración",
};

export type RolePermissions = Record<Role, PermissionKey[]>;

export const defaultRolePermissions: RolePermissions = {
  Administrador: ["reservas", "pedidos", "productos", "tickets", "conversaciones", "configuracion"],
  Gerente: ["reservas", "pedidos", "productos", "tickets", "conversaciones"],
  Mesero: ["reservas", "pedidos"],
  Cocina: ["pedidos"],
};

export type CalendarSettings = {
  openTime: string; // HH:mm
  closeTime: string; // HH:mm
  slotIntervalMinutes: number;
  bufferMinutes: number;
  maxPartySize: number;
  closedDays: number[]; // 0 = domingo ... 6 = sábado
  tables: string[];
};

export const weekdayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export const defaultCalendarSettings: CalendarSettings = {
  openTime: "12:00",
  closeTime: "22:30",
  slotIntervalMinutes: 30,
  bufferMinutes: 15,
  maxPartySize: 12,
  closedDays: [1],
  tables: ["Mesa 1", "Mesa 2", "Mesa 4", "Mesa 9", "Mesa 11", "Barra", "Terraza", "Salón privado"],
};

function toMinutes(time: string): number {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return h * 60 + m;
}

export function buildTimeSlots(settings: CalendarSettings): string[] {
  const start = toMinutes(settings.openTime);
  const end = toMinutes(settings.closeTime);
  const slots: string[] = [];
  for (let minutes = start; minutes <= end; minutes += settings.slotIntervalMinutes) {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  return slots;
}

export const currency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

export const orderTotal = (order: Order) =>
  order.items.reduce((sum, item) => sum + item.qty * item.price, 0);
