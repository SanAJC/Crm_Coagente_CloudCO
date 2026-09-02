-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "es_admin" BOOLEAN NOT NULL DEFAULT false;

-- A lo sumo un rol puede tener es_admin = true (ver src/auth/guards/admin.guard.ts).
-- Prisma Schema Language no expresa indices parciales de forma nativa.
CREATE UNIQUE INDEX "idx_roles_es_admin_unique" ON "roles" ("es_admin") WHERE "es_admin" = true;
