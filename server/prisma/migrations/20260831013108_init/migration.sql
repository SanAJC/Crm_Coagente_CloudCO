-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permisos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "modulo" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(255),

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles_permisos" (
    "role_id" INTEGER NOT NULL,
    "permiso_id" INTEGER NOT NULL,

    CONSTRAINT "roles_permisos_pkey" PRIMARY KEY ("role_id","permiso_id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(30),
    "estado" VARCHAR(20) NOT NULL DEFAULT 'activo',
    "ultimo_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_roles" (
    "usuario_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "usuarios_roles_pkey" PRIMARY KEY ("usuario_id","role_id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(255),

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" SERIAL NOT NULL,
    "sku" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "categoria_id" INTEGER,
    "precio" DECIMAL(12,2) NOT NULL,
    "costo" DECIMAL(12,2) DEFAULT 0,
    "stock_actual" INTEGER NOT NULL DEFAULT 0,
    "stock_minimo" INTEGER DEFAULT 0,
    "imagen_url" VARCHAR(255),
    "estado" VARCHAR(20) NOT NULL DEFAULT 'activo',
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150),
    "telefono" VARCHAR(30),
    "direccion" VARCHAR(255),
    "tipo_cliente" VARCHAR(20) DEFAULT 'regular',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "usuario_id" INTEGER,
    "fecha_reserva" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_inicio" TIMESTAMP(3),
    "fecha_fin" TIMESTAMP(3),
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserva_detalle" (
    "id" SERIAL NOT NULL,
    "reserva_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) GENERATED ALWAYS AS ("cantidad" * "precio_unitario") STORED,

    CONSTRAINT "reserva_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "reserva_id" INTEGER,
    "usuario_id" INTEGER,
    "fecha_pedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "direccion_envio" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_detalle" (
    "id" SERIAL NOT NULL,
    "pedido_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) GENERATED ALWAYS AS ("cantidad" * "precio_unitario") STORED,

    CONSTRAINT "pedido_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "pedido_id" INTEGER,
    "tipo" VARCHAR(30) NOT NULL DEFAULT 'seguimiento',
    "asunto" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "prioridad" VARCHAR(20) NOT NULL DEFAULT 'media',
    "estado" VARCHAR(20) NOT NULL DEFAULT 'abierto',
    "asignado_a" INTEGER,
    "creado_por" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_resolucion" TIMESTAMP(3),

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_seguimiento" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "usuario_id" INTEGER,
    "comentario" TEXT NOT NULL,
    "estado_anterior" VARCHAR(20),
    "estado_nuevo" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_seguimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversaciones" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER,
    "canal" VARCHAR(20) NOT NULL,
    "canal_chat_id" VARCHAR(150) NOT NULL,
    "ticket_id" INTEGER,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'abierta',
    "ultimo_mensaje_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensajes" (
    "id" SERIAL NOT NULL,
    "conversacion_id" INTEGER NOT NULL,
    "canal_mensaje_id" VARCHAR(150),
    "remitente" VARCHAR(20) NOT NULL,
    "tipo_contenido" VARCHAR(20) NOT NULL DEFAULT 'texto',
    "contenido" TEXT,
    "url_adjunto" VARCHAR(500),
    "metadata" JSONB,
    "enviado_por_usuario_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_nombre_key" ON "permisos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "productos_sku_key" ON "productos"("sku");

-- CreateIndex
CREATE INDEX "idx_productos_categoria" ON "productos"("categoria_id");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE INDEX "idx_reservas_cliente" ON "reservas"("cliente_id");

-- CreateIndex
CREATE INDEX "idx_reserva_detalle_res" ON "reserva_detalle"("reserva_id");

-- CreateIndex
CREATE INDEX "idx_pedidos_cliente" ON "pedidos"("cliente_id");

-- CreateIndex
CREATE INDEX "idx_pedidos_reserva" ON "pedidos"("reserva_id");

-- CreateIndex
CREATE INDEX "idx_pedido_detalle_ped" ON "pedido_detalle"("pedido_id");

-- CreateIndex
CREATE INDEX "idx_tickets_pedido" ON "tickets"("pedido_id");

-- CreateIndex
CREATE INDEX "idx_tickets_estado" ON "tickets"("estado");

-- CreateIndex
CREATE INDEX "idx_tickets_asignado" ON "tickets"("asignado_a");

-- CreateIndex
CREATE INDEX "idx_ticket_seg_ticket" ON "ticket_seguimiento"("ticket_id");

-- CreateIndex
CREATE INDEX "idx_conversaciones_cliente" ON "conversaciones"("cliente_id");

-- CreateIndex
CREATE INDEX "idx_conversaciones_ticket" ON "conversaciones"("ticket_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversaciones_canal_canal_chat_id_key" ON "conversaciones"("canal", "canal_chat_id");

-- CreateIndex
CREATE INDEX "idx_mensajes_conversacion" ON "mensajes"("conversacion_id");

-- AddForeignKey
ALTER TABLE "roles_permisos" ADD CONSTRAINT "roles_permisos_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_permisos" ADD CONSTRAINT "roles_permisos_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "permisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_roles" ADD CONSTRAINT "usuarios_roles_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_roles" ADD CONSTRAINT "usuarios_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_detalle" ADD CONSTRAINT "reserva_detalle_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_detalle" ADD CONSTRAINT "reserva_detalle_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_detalle" ADD CONSTRAINT "pedido_detalle_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_detalle" ADD CONSTRAINT "pedido_detalle_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_asignado_a_fkey" FOREIGN KEY ("asignado_a") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_seguimiento" ADD CONSTRAINT "ticket_seguimiento_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_seguimiento" ADD CONSTRAINT "ticket_seguimiento_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_conversacion_id_fkey" FOREIGN KEY ("conversacion_id") REFERENCES "conversaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_enviado_por_usuario_id_fkey" FOREIGN KEY ("enviado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Fidelidad con modelo_crm.sql: indices no expresables en Prisma Schema Language

-- CreateIndex (partial unique)
CREATE UNIQUE INDEX "idx_mensajes_canal_id" ON "mensajes"("canal_mensaje_id") WHERE "canal_mensaje_id" IS NOT NULL;

-- CreateIndex (GIN)
CREATE INDEX "idx_mensajes_metadata" ON "mensajes" USING GIN ("metadata");

-- Fidelidad con modelo_crm.sql: CHECK constraints no expresables en Prisma Schema Language

ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_estado_check" CHECK ("estado" IN ('activo', 'inactivo', 'suspendido'));

ALTER TABLE "productos" ADD CONSTRAINT "productos_precio_check" CHECK ("precio" >= 0);
ALTER TABLE "productos" ADD CONSTRAINT "productos_estado_check" CHECK ("estado" IN ('activo', 'inactivo', 'descontinuado'));

ALTER TABLE "clientes" ADD CONSTRAINT "clientes_tipo_cliente_check" CHECK ("tipo_cliente" IN ('regular', 'vip', 'corporativo'));

ALTER TABLE "reservas" ADD CONSTRAINT "reservas_estado_check" CHECK ("estado" IN ('pendiente', 'confirmada', 'cancelada', 'completada'));
ALTER TABLE "reserva_detalle" ADD CONSTRAINT "reserva_detalle_cantidad_check" CHECK ("cantidad" > 0);

ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_estado_check" CHECK ("estado" IN ('pendiente', 'en_proceso', 'enviado', 'entregado', 'cancelado'));
ALTER TABLE "pedido_detalle" ADD CONSTRAINT "pedido_detalle_cantidad_check" CHECK ("cantidad" > 0);

ALTER TABLE "tickets" ADD CONSTRAINT "tickets_tipo_check" CHECK ("tipo" IN ('seguimiento', 'incidencia', 'consulta', 'devolucion'));
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_prioridad_check" CHECK ("prioridad" IN ('baja', 'media', 'alta', 'urgente'));
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_estado_check" CHECK ("estado" IN ('abierto', 'en_proceso', 'resuelto', 'cerrado'));

ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_canal_check" CHECK ("canal" IN ('telegram', 'whatsapp', 'instagram'));
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_estado_check" CHECK ("estado" IN ('abierta', 'cerrada', 'archivada'));

ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_remitente_check" CHECK ("remitente" IN ('cliente', 'agente', 'sistema'));
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_tipo_contenido_check" CHECK ("tipo_contenido" IN ('texto', 'imagen', 'audio', 'video', 'documento', 'ubicacion'));
