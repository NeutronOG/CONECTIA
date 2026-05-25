-- ============================================================
-- MIGRACIÓN COMPLETA - CONECTIA / ARKIN SELECT
-- Ejecutar UNA sola vez en la nueva base de datos
-- Orden: tablas → campos extra → anuncios → fotógrafo → storage
-- ============================================================

-- =====================
-- 1. TABLAS BASE
-- =====================

-- Tabla de Propiedades
CREATE TABLE IF NOT EXISTS propiedades (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  ubicacion TEXT NOT NULL,
  precio BIGINT NOT NULL,
  precio_texto TEXT NOT NULL,
  tipo TEXT NOT NULL,
  habitaciones INTEGER NOT NULL,
  banos INTEGER NOT NULL,
  area INTEGER NOT NULL,
  area_texto TEXT NOT NULL,
  imagen TEXT,
  descripcion TEXT,
  caracteristicas TEXT[],
  status TEXT CHECK (status IN ('Disponible', 'Exclusiva', 'Reservada')) DEFAULT 'Disponible',
  categoria TEXT CHECK (categoria IN ('venta', 'renta', 'especial', 'remate', 'exclusivo')) DEFAULT 'venta',
  fecha_publicacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tour_virtual TEXT,
  galeria TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Agentes
CREATE TABLE IF NOT EXISTS agentes (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  especialidad TEXT,
  rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 5),
  ventas INTEGER DEFAULT 0,
  telefono TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación Propiedad-Agente
CREATE TABLE IF NOT EXISTS propiedad_agente (
  propiedad_id BIGINT REFERENCES propiedades(id) ON DELETE CASCADE,
  agente_id BIGINT REFERENCES agentes(id) ON DELETE CASCADE,
  asignado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (propiedad_id, agente_id)
);

-- Tabla de Detalles de Propiedades
CREATE TABLE IF NOT EXISTS propiedad_detalles (
  propiedad_id BIGINT PRIMARY KEY REFERENCES propiedades(id) ON DELETE CASCADE,
  tipo_propiedad TEXT,
  area_terreno TEXT,
  antiguedad TEXT,
  vistas INTEGER DEFAULT 0,
  favoritos INTEGER DEFAULT 0,
  publicado TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Usuarios (integrada con Supabase Auth)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  role TEXT CHECK (role IN ('admin', 'propietario', 'asesor', 'cliente')) DEFAULT 'cliente',
  telefono TEXT,
  avatar TEXT,
  plan TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Favoritos
CREATE TABLE IF NOT EXISTS favoritos (
  id BIGSERIAL PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  propiedad_id BIGINT REFERENCES propiedades(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, propiedad_id)
);

-- =====================
-- 2. ÍNDICES BASE
-- =====================

CREATE INDEX IF NOT EXISTS idx_propiedades_categoria ON propiedades(categoria);
CREATE INDEX IF NOT EXISTS idx_propiedades_status ON propiedades(status);
CREATE INDEX IF NOT EXISTS idx_propiedades_tipo ON propiedades(tipo);
CREATE INDEX IF NOT EXISTS idx_propiedades_precio ON propiedades(precio);
CREATE INDEX IF NOT EXISTS idx_propiedades_created_at ON propiedades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_propiedades_id ON propiedades(id);
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_propiedad ON favoritos(propiedad_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- =====================
-- 3. FUNCIÓN updated_at
-- =====================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_propiedades_updated_at ON propiedades;
CREATE TRIGGER update_propiedades_updated_at BEFORE UPDATE ON propiedades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agentes_updated_at ON agentes;
CREATE TRIGGER update_agentes_updated_at BEFORE UPDATE ON agentes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_propiedad_detalles_updated_at ON propiedad_detalles;
CREATE TRIGGER update_propiedad_detalles_updated_at BEFORE UPDATE ON propiedad_detalles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================
-- 4. ROW LEVEL SECURITY
-- =====================

ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE propiedad_detalles ENABLE ROW LEVEL SECURITY;

-- Propiedades
DROP POLICY IF EXISTS "Propiedades son visibles para todos" ON propiedades;
CREATE POLICY "Propiedades son visibles para todos" ON propiedades
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Solo admins, propietarios y asesores pueden insertar propiedades" ON propiedades;
CREATE POLICY "Solo admins, propietarios y asesores pueden insertar propiedades" ON propiedades
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'propietario', 'asesor'))
    );

DROP POLICY IF EXISTS "Solo admins, propietarios y asesores pueden actualizar propiedades" ON propiedades;
CREATE POLICY "Solo admins, propietarios y asesores pueden actualizar propiedades" ON propiedades
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'propietario', 'asesor'))
    );

DROP POLICY IF EXISTS "Solo admins pueden eliminar propiedades" ON propiedades;
CREATE POLICY "Solo admins pueden eliminar propiedades" ON propiedades
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin')
    );

-- Agentes
DROP POLICY IF EXISTS "Agentes son visibles para todos" ON agentes;
CREATE POLICY "Agentes son visibles para todos" ON agentes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Solo admins pueden gestionar agentes" ON agentes;
CREATE POLICY "Solo admins pueden gestionar agentes" ON agentes
    FOR ALL USING (
        EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin')
    );

-- Usuarios
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON usuarios;
CREATE POLICY "Usuarios pueden ver su propio perfil" ON usuarios
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON usuarios;
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON usuarios
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins pueden ver todos los usuarios" ON usuarios;
CREATE POLICY "Admins pueden ver todos los usuarios" ON usuarios
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin')
    );

-- Favoritos
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios favoritos" ON favoritos;
CREATE POLICY "Usuarios pueden ver sus propios favoritos" ON favoritos
    FOR SELECT USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuarios pueden agregar favoritos" ON favoritos;
CREATE POLICY "Usuarios pueden agregar favoritos" ON favoritos
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuarios pueden eliminar sus favoritos" ON favoritos;
CREATE POLICY "Usuarios pueden eliminar sus favoritos" ON favoritos
    FOR DELETE USING (auth.uid() = usuario_id);

-- Detalles propiedades
DROP POLICY IF EXISTS "Detalles de propiedades son visibles para todos" ON propiedad_detalles;
CREATE POLICY "Detalles de propiedades son visibles para todos" ON propiedad_detalles
    FOR SELECT USING (true);

-- =====================
-- 5. CAMPOS EXTRA EN PROPIEDADES
-- =====================

ALTER TABLE propiedades ADD COLUMN IF NOT EXISTS medios_banos INTEGER DEFAULT 0;
ALTER TABLE propiedades ADD COLUMN IF NOT EXISTS area_construccion INTEGER DEFAULT 0;
ALTER TABLE propiedades ADD COLUMN IF NOT EXISTS cochera INTEGER DEFAULT 0;

-- Campo fotógrafo
ALTER TABLE propiedades ADD COLUMN IF NOT EXISTS fotografo_id UUID REFERENCES auth.users(id);
ALTER TABLE propiedades ADD COLUMN IF NOT EXISTS imagenes TEXT[] DEFAULT '{}';

-- Campos adicionales de propiedades
ALTER TABLE propiedades ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id);
ALTER TABLE propiedades ADD COLUMN IF NOT EXISTS tipo_credito TEXT;
ALTER TABLE propiedades ADD COLUMN IF NOT EXISTS asesor_email TEXT;
ALTER TABLE propiedades ADD COLUMN IF NOT EXISTS bono NUMERIC;

-- =====================
-- 6. TABLA ANUNCIOS
-- =====================

CREATE TABLE IF NOT EXISTS anuncios (
  id TEXT PRIMARY KEY DEFAULT ('ad-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 9)),
  titulo TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  imagen TEXT DEFAULT '',
  enlace TEXT DEFAULT '',
  texto_boton TEXT DEFAULT 'Ver más',
  ubicacion TEXT NOT NULL DEFAULT 'entre-secciones' CHECK (ubicacion IN ('banner-hero', 'entre-secciones', 'lateral', 'footer')),
  estilo TEXT NOT NULL DEFAULT 'elegante' CHECK (estilo IN ('elegante', 'destacado', 'sutil')),
  activo BOOLEAN NOT NULL DEFAULT true,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'pausado', 'suspendido')),
  fecha_inicio TIMESTAMPTZ DEFAULT now(),
  fecha_fin TIMESTAMPTZ,
  creado_por TEXT DEFAULT '',
  creado_en TIMESTAMPTZ DEFAULT now(),
  clicks INTEGER DEFAULT 0,
  impresiones INTEGER DEFAULT 0
);

ALTER TABLE anuncios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anuncios_public_read" ON anuncios;
CREATE POLICY "anuncios_public_read" ON anuncios
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "anuncios_service_write" ON anuncios;
CREATE POLICY "anuncios_service_write" ON anuncios
  FOR ALL USING (true);

-- =====================
-- 7. TABLA SOLICITUDES FOTÓGRAFO
-- =====================

CREATE TABLE IF NOT EXISTS solicitudes_fotografo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fotografo_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  ubicacion TEXT NOT NULL,
  descripcion TEXT,
  precio_estimado NUMERIC,
  imagenes TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobada', 'rechazada')),
  notas_admin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  aprobada_por UUID REFERENCES auth.users(id),
  aprobada_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_fotografo_id ON solicitudes_fotografo(fotografo_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_status ON solicitudes_fotografo(status);
CREATE INDEX IF NOT EXISTS idx_solicitudes_created_at ON solicitudes_fotografo(created_at DESC);

ALTER TABLE solicitudes_fotografo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Fotógrafos pueden ver sus solicitudes" ON solicitudes_fotografo;
CREATE POLICY "Fotógrafos pueden ver sus solicitudes"
  ON solicitudes_fotografo FOR SELECT
  USING (auth.uid() = fotografo_id);

DROP POLICY IF EXISTS "Fotógrafos pueden crear solicitudes" ON solicitudes_fotografo;
CREATE POLICY "Fotógrafos pueden crear solicitudes"
  ON solicitudes_fotografo FOR INSERT
  WITH CHECK (auth.uid() = fotografo_id);

DROP POLICY IF EXISTS "Fotógrafos pueden actualizar sus solicitudes pendientes" ON solicitudes_fotografo;
CREATE POLICY "Fotógrafos pueden actualizar sus solicitudes pendientes"
  ON solicitudes_fotografo FOR UPDATE
  USING (auth.uid() = fotografo_id AND status = 'pendiente');

DROP POLICY IF EXISTS "Admins pueden ver todas las solicitudes" ON solicitudes_fotografo;
CREATE POLICY "Admins pueden ver todas las solicitudes"
  ON solicitudes_fotografo FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins pueden actualizar solicitudes" ON solicitudes_fotografo;
CREATE POLICY "Admins pueden actualizar solicitudes"
  ON solicitudes_fotografo FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin')
  );

DROP TRIGGER IF EXISTS update_solicitudes_fotografo_updated_at ON solicitudes_fotografo;
CREATE TRIGGER update_solicitudes_fotografo_updated_at
  BEFORE UPDATE ON solicitudes_fotografo
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================
-- 8. STORAGE
-- =====================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'propiedades',
  'propiedades',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

DROP POLICY IF EXISTS "Imagenes publicas" ON storage.objects;
CREATE POLICY "Imagenes publicas" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'propiedades');

DROP POLICY IF EXISTS "Usuarios pueden subir imagenes" ON storage.objects;
CREATE POLICY "Usuarios pueden subir imagenes" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'propiedades');

DROP POLICY IF EXISTS "Subida anonima de imagenes" ON storage.objects;
CREATE POLICY "Subida anonima de imagenes" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'propiedades');

DROP POLICY IF EXISTS "Usuarios pueden eliminar sus imagenes" ON storage.objects;
CREATE POLICY "Usuarios pueden eliminar sus imagenes" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'propiedades');

-- =====================
-- 9. AJUSTES DE PERFORMANCE
-- =====================

ALTER ROLE authenticator SET statement_timeout = '300s';
ALTER ROLE anon SET statement_timeout = '300s';

-- =====================
-- VERIFICACIÓN FINAL
-- =====================

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
