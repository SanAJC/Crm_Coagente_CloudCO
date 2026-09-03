-- Usuario de sistema para atribuir (created_by / usuario_id / creado_por) las
-- reservas, pedidos y tickets que crea el agente de n8n via /webhooks/n8n/*.
-- No inicia sesion nunca: el hash de password es aleatorio e inservible, la
-- autenticacion de esas rutas es por API key (AgentApiKeyGuard), no por login.
INSERT INTO "usuarios" ("nombre", "email", "password_hash", "estado")
VALUES ('Agente IA', 'agente-ia@sistema.local', '$2b$10$FonwMcXNQc35Trk1RX/AO.KtMGpeQCqprUC3gBPDIn6XZPvRJWNiu', 'activo')
ON CONFLICT ("email") DO NOTHING;
