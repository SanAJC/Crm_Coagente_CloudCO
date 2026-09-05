export type ChatChannel = "whatsapp" | "telegram" | "instagram";

export type ChatMessage = {
  id: string;
  from: "cliente" | "agente" | "equipo";
  text: string;
  time: string;
};

export type Conversation = {
  id: string;
  channel: ChatChannel;
  name: string;
  handle: string;
  phone: string;
  email: string;
  city: string;
  since: string;
  orders: number;
  lastOrder: string;
  tags: string[];
  status: "en línea" | "resuelta" | "esperando";
  unread: number;
  lastTime: string;
  preview: string;
  suggestion: string;
  messages: ChatMessage[];
};

export const channelLabels: Record<ChatChannel, string> = {
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  instagram: "Instagram",
};

export const demoConversations: Conversation[] = [
  {
    id: "c1",
    channel: "whatsapp",
    name: "María González",
    handle: "+57 300 123 4567",
    phone: "+57 300 123 4567",
    email: "maria.gonzalez@gmail.com",
    city: "Medellín, Colombia",
    since: "Feb 2024",
    orders: 7,
    lastOrder: "15 May 2026",
    tags: ["Cliente frecuente", "Reserva"],
    status: "en línea",
    unread: 2,
    lastTime: "11:30",
    preview: "Hola, ¿tienen mesa disponible…",
    suggestion:
      "¿Quieres que confirme la reserva para 4 personas a las 8:00 pm en la terraza y le envíe el recordatorio?",
    messages: [
      {
        id: "m1",
        from: "cliente",
        text: "Hola, ¿tienen mesa disponible para hoy a las 8 pm?",
        time: "11:30",
      },
      {
        id: "m2",
        from: "agente",
        text: "¡Hola María! 👋\nSí, tenemos disponibilidad a las 8:00 pm. ¿Para cuántas personas sería?",
        time: "11:31",
      },
      { id: "m3", from: "cliente", text: "Seríamos 4. ¿Se puede en la terraza?", time: "11:32" },
      {
        id: "m4",
        from: "agente",
        text: "Perfecto 🙌 La terraza está libre a esa hora.\nDejo la reserva a nombre de María González, 4 personas, 8:00 pm.",
        time: "11:33",
      },
      { id: "m5", from: "cliente", text: "Excelente, muchas gracias 👌", time: "11:34" },
    ],
  },
  {
    id: "c2",
    channel: "whatsapp",
    name: "Carlos Rodríguez",
    handle: "+57 310 887 2211",
    phone: "+57 310 887 2211",
    email: "carlos.r@outlook.com",
    city: "Bogotá, Colombia",
    since: "Ene 2025",
    orders: 3,
    lastOrder: "2 Ago 2026",
    tags: ["Delivery"],
    status: "esperando",
    unread: 1,
    lastTime: "11:28",
    preview: "Quisiera información sobre el menú…",
    suggestion: "¿Le comparto el menú del día y el costo de domicilio a su zona?",
    messages: [
      {
        id: "m1",
        from: "cliente",
        text: "Buenas, quisiera información sobre el menú del día",
        time: "11:26",
      },
      {
        id: "m2",
        from: "agente",
        text: "¡Con gusto! Hoy tenemos risotto de hongos y lomo al carbón 🔥",
        time: "11:27",
      },
      { id: "m3", from: "cliente", text: "¿Hacen envíos a Chapinero?", time: "11:28" },
    ],
  },
  {
    id: "c3",
    channel: "whatsapp",
    name: "Laura Méndez",
    handle: "+57 320 445 9087",
    phone: "+57 320 445 9087",
    email: "lau.mendez@gmail.com",
    city: "Cali, Colombia",
    since: "Mar 2026",
    orders: 1,
    lastOrder: "10 Ago 2026",
    tags: ["Nueva"],
    status: "resuelta",
    unread: 0,
    lastTime: "11:20",
    preview: "Gracias, muy amable",
    suggestion: "Conversación cerrada. ¿Envío una encuesta de satisfacción?",
    messages: [
      { id: "m1", from: "cliente", text: "¿Tienen opciones sin gluten?", time: "11:18" },
      {
        id: "m2",
        from: "agente",
        text: "Sí, el ceviche y el salmón son libres de gluten 🌿",
        time: "11:19",
      },
      { id: "m3", from: "cliente", text: "Gracias, muy amable", time: "11:20" },
    ],
  },
  {
    id: "c4",
    channel: "telegram",
    name: "Juan Pérez",
    handle: "@juanperez",
    phone: "+57 315 220 1140",
    email: "juanp@gmail.com",
    city: "Medellín, Colombia",
    since: "Jun 2025",
    orders: 5,
    lastOrder: "18 Ago 2026",
    tags: ["Pedido abierto"],
    status: "en línea",
    unread: 1,
    lastTime: "11:15",
    preview: "Hola, necesito ayuda con mi pedido",
    suggestion: "¿Reviso el estado del pedido PED-2042 y le informo el tiempo de entrega?",
    messages: [
      {
        id: "m1",
        from: "cliente",
        text: "Hola, necesito ayuda con mi pedido TCK-2042",
        time: "11:14",
      },
      {
        id: "m2",
        from: "agente",
        text: "¡Claro Juan! Tu pedido está en cocina, sale en ~15 minutos ⏱️",
        time: "11:15",
      },
    ],
  },
  {
    id: "c5",
    channel: "telegram",
    name: "Ana Torres",
    handle: "@anatorres",
    phone: "+57 301 990 4432",
    email: "ana.torres@gmail.com",
    city: "Barranquilla, Colombia",
    since: "Dic 2025",
    orders: 2,
    lastOrder: "5 Ago 2026",
    tags: ["Pago"],
    status: "esperando",
    unread: 1,
    lastTime: "11:05",
    preview: "¿Cómo puedo realizar un pago?",
    suggestion: "¿Genero un link de pago por el total del pedido?",
    messages: [
      {
        id: "m1",
        from: "cliente",
        text: "¿Cómo puedo realizar un pago anticipado?",
        time: "11:05",
      },
    ],
  },
  {
    id: "c6",
    channel: "instagram",
    name: "@tiendacloud",
    handle: "@tiendacloud",
    phone: "—",
    email: "hola@tiendacloud.co",
    city: "Medellín, Colombia",
    since: "Ago 2026",
    orders: 0,
    lastOrder: "—",
    tags: ["Prospecto"],
    status: "esperando",
    unread: 2,
    lastTime: "11:25",
    preview: "Hola, ¿hacen eventos privados?",
    suggestion: "¿Le comparto la carta de eventos y la disponibilidad del salón privado?",
    messages: [
      {
        id: "m1",
        from: "cliente",
        text: "Hola, ¿hacen eventos privados para 20 personas?",
        time: "11:24",
      },
      { id: "m2", from: "cliente", text: "¿Y tienen menú cerrado?", time: "11:25" },
    ],
  },
];
