-- Tabla de Auditoría para CONECTIA
-- Registra todas las actividades de usuarios, especialmente Ari

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    entity_name TEXT,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT
);

-- Índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Índice específico para Ari (editor principal)
CREATE INDEX IF NOT EXISTS idx_audit_logs_ari ON audit_logs(user_email) WHERE user_email = 'ari@conectia.mx';

-- Comentarios de documentación
COMMENT ON TABLE audit_logs IS 'Registro de auditoría de todas las acciones en el sistema CONECTIA';
COMMENT ON COLUMN audit_logs.id IS 'ID único del log';
COMMENT ON COLUMN audit_logs.user_id IS 'ID del usuario que realizó la acción';
COMMENT ON COLUMN audit_logs.user_email IS 'Email del usuario (importante para identificar a Ari)';
COMMENT ON COLUMN audit_logs.action IS 'Tipo de acción: login, logout, propiedad_creada, propiedad_eliminada, etc.';
COMMENT ON COLUMN audit_logs.entity_type IS 'Tipo de entidad afectada: propiedad, solicitud, asesor, sistema, usuario';
COMMENT ON COLUMN audit_logs.entity_id IS 'ID de la entidad afectada';
COMMENT ON COLUMN audit_logs.details IS 'Detalles adicionales en formato JSON';

-- Políticas RLS (Row Level Security) para seguridad
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver los logs
CREATE POLICY "Admins pueden ver todos los logs"
    ON audit_logs
    FOR SELECT
    USING (
        auth.jwt() ->> 'email' LIKE '%@conectia.mx' OR
        auth.jwt() ->> 'role' = 'admin'
    );

-- Permitir inserciones desde la API (service role)
CREATE POLICY "Service role puede insertar logs"
    ON audit_logs
    FOR INSERT
    WITH CHECK (true);

-- Configurar para que los logs se mantengan por 1 año (opcional, usar con cuidado)
-- SELECT cron.schedule('0 0 * * *', $$ DELETE FROM audit_logs WHERE timestamp < NOW() - INTERVAL '1 year' $$);
