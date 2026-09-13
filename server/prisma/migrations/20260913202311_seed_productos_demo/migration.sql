-- Datos de demostración para el catálogo de productos (Casa Aurora), en la
-- base de datos real -- no mock del frontend. Idempotente: se puede correr
-- más de una vez sin duplicar filas (nombre de categoría y sku son únicos).

INSERT INTO "categorias" ("nombre", "descripcion") VALUES
  ('Entrantes', 'Para compartir antes del plato fuerte'),
  ('Platos Fuertes', 'Los platos principales de la carta'),
  ('Postres', 'Para cerrar la comida'),
  ('Bebidas', 'Frías, calientes y con o sin alcohol')
ON CONFLICT ("nombre") DO NOTHING;

INSERT INTO "productos" ("sku", "nombre", "descripcion", "categoria_id", "precio", "costo", "stock_actual", "stock_minimo", "estado")
SELECT v.sku, v.nombre, v.descripcion, c.id, v.precio, v.costo, v.stock_actual, v.stock_minimo, 'activo'
FROM (VALUES
  ('SKU-ENT-001', 'Ensalada César', 'Lechuga, pollo a la plancha, parmesano y aderezo césar', 'Entrantes', 14000, 6000, 20, 5),
  ('SKU-PF-001', 'Hamburguesa Clásica', 'Carne de res, queso cheddar, lechuga, tomate y salsa especial', 'Platos Fuertes', 18000, 8000, 30, 5),
  ('SKU-PF-002', 'Pizza Margarita', 'Salsa de tomate, mozzarella fresca y albahaca', 'Platos Fuertes', 32000, 14000, 15, 5),
  ('SKU-POS-001', 'Torta de Chocolate', 'Torta húmeda de chocolate con ganache', 'Postres', 12000, 4500, 25, 5),
  ('SKU-BEB-001', 'Limonada Natural', 'Limonada de la casa, endulzada al gusto', 'Bebidas', 6000, 1500, 50, 10),
  ('SKU-BEB-002', 'Gaseosa', 'Botella personal 400ml', 'Bebidas', 5000, 2000, 50, 10)
) AS v(sku, nombre, descripcion, categoria_nombre, precio, costo, stock_actual, stock_minimo)
JOIN "categorias" c ON c."nombre" = v.categoria_nombre
ON CONFLICT ("sku") DO NOTHING;
