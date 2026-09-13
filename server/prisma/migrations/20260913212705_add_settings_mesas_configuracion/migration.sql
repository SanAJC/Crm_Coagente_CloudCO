-- Catalogo de mesas del negocio
CREATE TABLE "mesas" (
    "id" SERIAL PRIMARY KEY,
    "nombre" VARCHAR(50) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true
);
CREATE UNIQUE INDEX "mesas_nombre_key" ON "mesas"("nombre");

-- Configuracion general del negocio (fila unica, id fijo = 1)
CREATE TABLE "configuracion_negocio" (
    "id" INTEGER PRIMARY KEY DEFAULT 1,
    "hora_apertura" VARCHAR(5) NOT NULL DEFAULT '12:00',
    "hora_cierre" VARCHAR(5) NOT NULL DEFAULT '22:30',
    "intervalo_minutos" INTEGER NOT NULL DEFAULT 30,
    "buffer_minutos" INTEGER NOT NULL DEFAULT 15,
    "tamano_maximo_grupo" INTEGER NOT NULL DEFAULT 12,
    "dias_cerrados" INTEGER[] NOT NULL DEFAULT ARRAY[1]::INTEGER[],
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Reservas: la mesa pasa de texto libre a una relacion real con el catalogo
ALTER TABLE "reservas" DROP COLUMN "mesa";
ALTER TABLE "reservas" ADD COLUMN "mesa_id" INTEGER;
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_mesa_id_fkey"
  FOREIGN KEY ("mesa_id") REFERENCES "mesas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Pedidos: tambien pueden asociarse a una mesa (clientes en fisico)
ALTER TABLE "pedidos" ADD COLUMN "mesa_id" INTEGER;
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_mesa_id_fkey"
  FOREIGN KEY ("mesa_id") REFERENCES "mesas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Datos iniciales
INSERT INTO "mesas" ("nombre") VALUES
  ('Mesa 1'), ('Mesa 2'), ('Mesa 4'), ('Mesa 9'), ('Mesa 11'), ('Barra'), ('Terraza'), ('Salón privado')
ON CONFLICT ("nombre") DO NOTHING;

INSERT INTO "configuracion_negocio" ("id") VALUES (1) ON CONFLICT ("id") DO NOTHING;

-- Nuevo permiso para gestionar horarios/mesas, otorgado a admin y ventas
INSERT INTO "permisos" ("nombre", "modulo", "descripcion") VALUES
  ('configuracion.gestionar', 'configuracion', 'Editar horarios y mesas del negocio')
ON CONFLICT ("nombre") DO NOTHING;

INSERT INTO "roles_permisos" ("role_id", "permiso_id")
SELECT r.id, p.id FROM "roles" r, "permisos" p
WHERE r.nombre IN ('admin', 'ventas') AND p.nombre = 'configuracion.gestionar'
ON CONFLICT DO NOTHING;
