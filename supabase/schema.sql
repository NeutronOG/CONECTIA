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

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_propiedades_categoria ON propiedades(categoria);
CREATE INDEX IF NOT EXISTS idx_propiedades_status ON propiedades(status);
CREATE INDEX IF NOT EXISTS idx_propiedades_tipo ON propiedades(tipo);
CREATE INDEX IF NOT EXISTS idx_propiedades_precio ON propiedades(precio);
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_propiedad ON favoritos(propiedad_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_propiedades_updated_at BEFORE UPDATE ON propiedades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agentes_updated_at BEFORE UPDATE ON agentes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_propiedad_detalles_updated_at BEFORE UPDATE ON propiedad_detalles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE propiedad_detalles ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para propiedades (lectura pública, escritura autenticada)
CREATE POLICY "Propiedades son visibles para todos" ON propiedades
    FOR SELECT USING (true);

CREATE POLICY "Solo admins, propietarios y asesores pueden insertar propiedades" ON propiedades
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'propietario', 'asesor')
        )
    );

CREATE POLICY "Solo admins, propietarios y asesores pueden actualizar propiedades" ON propiedades
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'propietario', 'asesor')
        )
    );

CREATE POLICY "Solo admins pueden eliminar propiedades" ON propiedades
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Políticas para agentes (lectura pública)
CREATE POLICY "Agentes son visibles para todos" ON agentes
    FOR SELECT USING (true);

CREATE POLICY "Solo admins pueden gestionar agentes" ON agentes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Políticas para usuarios (cada usuario ve su propio perfil)
CREATE POLICY "Usuarios pueden ver su propio perfil" ON usuarios
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON usuarios
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para favoritos (cada usuario gestiona sus favoritos)
CREATE POLICY "Usuarios pueden ver sus propios favoritos" ON favoritos
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden agregar favoritos" ON favoritos
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden eliminar sus favoritos" ON favoritos
    FOR DELETE USING (auth.uid() = usuario_id);

-- Políticas para detalles de propiedades (lectura pública)
CREATE POLICY "Detalles de propiedades son visibles para todos" ON propiedad_detalles
    FOR SELECT USING (true);
