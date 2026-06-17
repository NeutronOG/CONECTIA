-- Tabla de solicitudes de propiedades (asesor solicita fotografía al fotógrafo)
CREATE TABLE IF NOT EXISTS public.solicitudes_propiedad (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asesor_email TEXT NOT NULL,
  asesor_nombre TEXT,
  titulo TEXT NOT NULL,
  ubicacion TEXT,
  descripcion TEXT,
  precio_estimado NUMERIC,
  tipo TEXT DEFAULT 'Departamento',
  categoria TEXT DEFAULT 'venta',
  habitaciones INTEGER,
  banos INTEGER,
  area NUMERIC,
  status TEXT DEFAULT 'pendiente',
  notas_fotografo TEXT,
  imagenes JSONB DEFAULT '[]'::jsonb,
  datos_extra JSONB DEFAULT '{}'::jsonb,
  propiedad_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_solicitudes_asesor_email ON public.solicitudes_propiedad(asesor_email);
CREATE INDEX IF NOT EXISTS idx_solicitudes_status ON public.solicitudes_propiedad(status);

-- Políticas RLS
ALTER TABLE public.solicitudes_propiedad ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for service role" ON public.solicitudes_propiedad;
CREATE POLICY "Allow all for service role" ON public.solicitudes_propiedad
  FOR ALL USING (true) WITH CHECK (true);
