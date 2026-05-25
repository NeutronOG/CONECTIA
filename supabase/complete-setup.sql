-- ============================================
-- PASO 1: Crear las tablas (si no lo has hecho)
-- ============================================

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

-- ============================================
-- PASO 2: Insertar los datos
-- ============================================

-- Insertar Agentes
INSERT INTO agentes (nombre, especialidad, rating, ventas, telefono, email) VALUES
('María Elena Vázquez', 'Especialista en Propiedades de Lujo', 4.9, 127, '+52 1 477 475 6951', 'maria.vazquez@arkinselect.mx'),
('Carlos Mendoza', 'Especialista en Villas de Lujo', 4.8, 95, '+52 1 477 475 6951', 'carlos.mendoza@arkinselect.mx'),
('Ana Sofía Ruiz', 'Especialista en Roma Norte', 4.7, 78, '+52 1 477 475 6951', 'ana.ruiz@arkinselect.mx'),
('Roberto Silva', 'Especialista en Lofts Modernos', 4.6, 62, '+52 1 477 475 6951', 'roberto.silva@arkinselect.mx'),
('Luis Fernando García', 'Especialista en Interlomas', 4.5, 89, '+52 1 477 475 6951', 'luis.garcia@arkinselect.mx')
ON CONFLICT (email) DO NOTHING;

-- Insertar Propiedades
INSERT INTO propiedades (id, titulo, ubicacion, precio, precio_texto, tipo, habitaciones, banos, area, area_texto, imagen, descripcion, caracteristicas, status, categoria, fecha_publicacion, galeria) VALUES
(1, 'Penthouse Polanco IV', 'Polanco, CDMX', 18500000, '$18,500,000', 'Penthouse', 4, 5, 450, '450 m²', '/luxury-penthouse-polanco-main.png', 'Exclusivo penthouse con vista panorámica de la ciudad, acabados de lujo y terraza privada. Una oportunidad única de vivir en el corazón de Polanco con la más alta calidad, elegancia, funcionalidad y ubicación privilegiada en el corazón de Polanco.', ARRAY['Vista panorámica', 'Terraza privada', 'Acabados premium', 'Ubicación exclusiva', 'Piscina', 'Gimnasio'], 'Disponible', 'venta', '2024-03-15', ARRAY['/luxury-penthouse-polanco-main.png', '/penthouse-living.jpg', '/penthouse-terrace.jpg', '/penthouse-bedroom.jpg']),

(2, 'Villa Santa Fe', 'Santa Fe, CDMX', 22800000, '$22,800,000', 'Villa', 6, 7, 680, '680 m²', '/luxury-villa-santa-fe.png', 'Majestuosa villa con jardín privado, piscina infinity y diseño arquitectónico contemporáneo. Ubicada en la exclusiva zona de Santa Fe con seguridad 24/7 y amenidades de primer nivel.', ARRAY['Jardín privado', 'Piscina infinity', 'Diseño contemporáneo', 'Seguridad 24/7', 'Gimnasio', 'Spa privado'], 'Exclusiva', 'exclusivo', '2024-02-20', NULL),

(3, 'Residencia Roma Norte', 'Roma Norte, CDMX', 15200000, '$15,200,000', 'Residencia', 3, 4, 320, '320 m²', '/modern-apartment-roma-norte.png', 'Elegante residencia en el corazón de Roma Norte, con diseño moderno y ubicación privilegiada. Cerca de los mejores restaurantes, galerías y vida cultural de la ciudad.', ARRAY['Ubicación central', 'Diseño moderno', 'Balcón privado', 'Cerca de restaurantes', 'Vida cultural', 'Transporte público'], 'Reservada', 'especial', '2024-01-10', NULL),

(4, 'Loft Condesa Premium', 'Condesa, CDMX', 12800000, '$12,800,000', 'Loft', 2, 2, 180, '180 m²', '/modern-loft-condesa.png', 'Moderno loft en la vibrante Condesa, con techos altos y diseño industrial contemporáneo. Perfecto para profesionales que buscan estilo y ubicación privilegiada.', ARRAY['Techos altos', 'Diseño industrial', 'Ubicación central', 'Terraza privada', 'Vida nocturna', 'Parques cercanos'], 'Disponible', 'renta', '2024-03-01', NULL),

(6, 'Departamento Interlomas', 'Interlomas, Estado de México', 8500000, '$8,500,000', 'Departamento', 3, 3, 220, '220 m²', '/apartment-interlomas.png', 'Cómodo departamento en Interlomas con amenidades completas y ubicación estratégica. Ideal para familias que buscan tranquilidad sin alejarse de la ciudad.', ARRAY['Amenidades completas', 'Ubicación estratégica', 'Seguridad', 'Áreas verdes', 'Club deportivo', 'Transporte'], 'Disponible', 'remate', '2024-01-25', NULL)
ON CONFLICT (id) DO NOTHING;

-- Crear relaciones Propiedad-Agente
INSERT INTO propiedad_agente (propiedad_id, agente_id)
SELECT p.id, a.id FROM propiedades p, agentes a WHERE p.id = 1 AND a.email = 'maria.vazquez@arkinselect.mx'
UNION ALL
SELECT p.id, a.id FROM propiedades p, agentes a WHERE p.id = 2 AND a.email = 'carlos.mendoza@arkinselect.mx'
UNION ALL
SELECT p.id, a.id FROM propiedades p, agentes a WHERE p.id = 3 AND a.email = 'ana.ruiz@arkinselect.mx'
UNION ALL
SELECT p.id, a.id FROM propiedades p, agentes a WHERE p.id = 4 AND a.email = 'roberto.silva@arkinselect.mx'
UNION ALL
SELECT p.id, a.id FROM propiedades p, agentes a WHERE p.id = 6 AND a.email = 'luis.garcia@arkinselect.mx'
ON CONFLICT (propiedad_id, agente_id) DO NOTHING;

-- Insertar detalles de propiedades
INSERT INTO propiedad_detalles (propiedad_id, tipo_propiedad, area_terreno, antiguedad, vistas, favoritos, publicado) VALUES
(1, 'Penthouse', '450 m²', '2 años', 1247, 89, '14/3/2024'),
(2, 'Villa', '680 m²', 'Nueva', 892, 156, '20/2/2024'),
(3, 'Residencia', '320 m²', '5 años', 654, 43, '10/1/2024'),
(4, 'Loft', '180 m²', '3 años', 423, 67, '1/3/2024'),
(6, 'Departamento', '220 m²', '7 años', 312, 28, '25/1/2024')
ON CONFLICT (propiedad_id) DO NOTHING;

-- ============================================
-- PASO 3: Tabla de Solicitudes de Fotógrafo
-- ============================================

-- Crear tabla de solicitudes de propiedades del fotógrafo
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

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_solicitudes_fotografo_id ON solicitudes_fotografo(fotografo_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_status ON solicitudes_fotografo(status);
CREATE INDEX IF NOT EXISTS idx_solicitudes_created_at ON solicitudes_fotografo(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE solicitudes_fotografo ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Fotógrafos pueden ver sus solicitudes" ON solicitudes_fotografo;
DROP POLICY IF EXISTS "Fotógrafos pueden crear solicitudes" ON solicitudes_fotografo;
DROP POLICY IF EXISTS "Fotógrafos pueden actualizar sus solicitudes pendientes" ON solicitudes_fotografo;
DROP POLICY IF EXISTS "Admins pueden ver todas las solicitudes" ON solicitudes_fotografo;
DROP POLICY IF EXISTS "Admins pueden actualizar solicitudes" ON solicitudes_fotografo;

-- Políticas: Fotógrafos pueden ver y crear sus propias solicitudes
CREATE POLICY "Fotógrafos pueden ver sus solicitudes"
  ON solicitudes_fotografo
  FOR SELECT
  USING (auth.uid() = fotografo_id);

CREATE POLICY "Fotógrafos pueden crear solicitudes"
  ON solicitudes_fotografo
  FOR INSERT
  WITH CHECK (auth.uid() = fotografo_id);

CREATE POLICY "Fotógrafos pueden actualizar sus solicitudes pendientes"
  ON solicitudes_fotografo
  FOR UPDATE
  USING (auth.uid() = fotografo_id AND status = 'pendiente');

-- Políticas: Admins pueden ver y actualizar todas las solicitudes
CREATE POLICY "Admins pueden ver todas las solicitudes"
  ON solicitudes_fotografo
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins pueden actualizar solicitudes"
  ON solicitudes_fotografo
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_solicitudes_fotografo_updated_at ON solicitudes_fotografo;

CREATE TRIGGER update_solicitudes_fotografo_updated_at
  BEFORE UPDATE ON solicitudes_fotografo
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Agregar campo fotografo_id a propiedades si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'propiedades' AND column_name = 'fotografo_id'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN fotografo_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- ============================================
-- PASO 4: Verificar que se insertaron los datos
-- ============================================

SELECT 'Agentes:' as tabla, COUNT(*) as total FROM agentes
UNION ALL
SELECT 'Propiedades:', COUNT(*) FROM propiedades
UNION ALL
SELECT 'Relaciones:', COUNT(*) FROM propiedad_agente
UNION ALL
SELECT 'Detalles:', COUNT(*) FROM propiedad_detalles
UNION ALL
SELECT 'Solicitudes Fotógrafo:', COUNT(*) FROM solicitudes_fotografo;