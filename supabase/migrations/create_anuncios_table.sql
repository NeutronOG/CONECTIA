-- Tabla de anuncios publicitarios (reemplaza localStorage)
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

-- RLS policies
ALTER TABLE anuncios ENABLE ROW LEVEL SECURITY;

-- Lectura pública (para mostrar en homepage)
CREATE POLICY "anuncios_public_read" ON anuncios
  FOR SELECT USING (true);

-- Solo service role puede escribir (desde API routes del server)
CREATE POLICY "anuncios_service_write" ON anuncios
  FOR ALL USING (true);
