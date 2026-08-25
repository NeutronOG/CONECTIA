-- Setup completo para Ari (tabla + usuario)
-- Ejecutar TODO este script de una vez en Supabase SQL Editor

-- ============================================
-- 1. CREAR TABLA USUARIOS (si no existe)
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    nombre TEXT,
    role TEXT NOT NULL DEFAULT 'cliente',
    telefono TEXT,
    avatar TEXT,
    propiedad_id INTEGER,
    plan TEXT,
    permisos TEXT[],
    es_editor_principal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);

-- ============================================
-- 2. CREAR TABLA AUDIT LOGS (si no existe)
-- ============================================
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

-- Índices para auditoría
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ari ON audit_logs(user_email) WHERE user_email = 'ari@conectia.mx';

-- ============================================
-- 3. INSERTAR USUARIO ARI
-- ============================================
INSERT INTO usuarios (id, email, nombre, role, telefono, avatar, permisos, es_editor_principal)
VALUES (
    gen_random_uuid(),
    'ari@conectia.mx',
    'Ari',
    'admin',
    '563-157-2468',
    '/avatars/ari.jpg',
    ARRAY['editar_propiedades', 'subir_propiedades', 'bajar_propiedades', 'ver_logs'],
    true
)
ON CONFLICT (email) DO UPDATE SET
    nombre = 'Ari',
    role = 'admin',
    telefono = '563-157-2468',
    avatar = '/avatars/ari.jpg',
    permisos = ARRAY['editar_propiedades', 'subir_propiedades', 'bajar_propiedades', 'ver_logs'],
    es_editor_principal = true;

-- ============================================
-- 4. CONFIGURAR RLS (Seguridad)
-- ============================================

-- Usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins pueden ver todos los usuarios" ON usuarios;
CREATE POLICY "Admins pueden ver todos los usuarios"
    ON usuarios
    FOR SELECT
    USING (role = 'admin' OR auth.uid() = id);

DROP POLICY IF EXISTS "Service role puede gestionar usuarios" ON usuarios;
CREATE POLICY "Service role puede gestionar usuarios"
    ON usuarios
    FOR ALL
    USING (true);

-- Audit Logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins pueden ver logs" ON audit_logs;
CREATE POLICY "Admins pueden ver logs"
    ON audit_logs
    FOR SELECT
    USING (auth.jwt() ->> 'email' LIKE '%@conectia.mx');

DROP POLICY IF EXISTS "Service role puede insertar logs" ON audit_logs;
CREATE POLICY "Service role puede insertar logs"
    ON audit_logs
    FOR INSERT
    WITH CHECK (true);

-- ============================================
-- ✅ LISTO! Ari está configurada
-- ============================================
-- Nota: La contraseña debe establecerse via Supabase Dashboard:
-- Authentication → Users → Invite user: ari@conectia.mx
-- Password: ari_conectia2025
