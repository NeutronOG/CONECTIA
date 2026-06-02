-- Crear tabla de usuarios si no existe
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

-- Comentarios
COMMENT ON TABLE usuarios IS 'Tabla de usuarios de CONECTIA';

-- RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Admins pueden ver todos los usuarios"
    ON usuarios
    FOR SELECT
    USING (role = 'admin' OR auth.uid() = id);

CREATE POLICY "Admins pueden insertar usuarios"
    ON usuarios
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins pueden actualizar usuarios"
    ON usuarios
    FOR UPDATE
    USING (role = 'admin' OR auth.uid() = id);
