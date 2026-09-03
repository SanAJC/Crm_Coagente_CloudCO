-- DropForeignKey
ALTER TABLE "reserva_detalle" DROP CONSTRAINT "reserva_detalle_producto_id_fkey";

-- DropForeignKey
ALTER TABLE "reserva_detalle" DROP CONSTRAINT "reserva_detalle_reserva_id_fkey";

-- DropForeignKey
ALTER TABLE "ticket_seguimiento" DROP CONSTRAINT "ticket_seguimiento_ticket_id_fkey";

-- DropForeignKey
ALTER TABLE "ticket_seguimiento" DROP CONSTRAINT "ticket_seguimiento_usuario_id_fkey";

-- DropTable
DROP TABLE "reserva_detalle";

-- DropTable
DROP TABLE "ticket_seguimiento";
