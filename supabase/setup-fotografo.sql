-- ============================================
-- CONFIGURACIÓN COMPLETA PARA SISTEMA DE FOTÓGRAFO
-- Ejecutar este script en Supabase SQL Editor
-- ============================================

-- 1. Crear tabla de solicitudes de propiedades del fotógrafo
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

-- 2. Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_solicitudes_fotografo_id ON solicitudes_fotografo(fotografo_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_status ON solicitudes_fotografo(status);
CREATE INDEX IF NOT EXISTS idx_solicitudes_created_at ON solicitudes_fotografo(created_at DESC);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE solicitudes_fotografo ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Fotógrafos pueden ver sus solicitudes" ON solicitudes_fotografo;
DROP POLICY IF EXISTS "Fotógrafos pueden crear solicitudes" ON solicitudes_fotografo;
DROP POLICY IF EXISTS "Fotógrafos pueden actualizar sus solicitudes pendientes" ON solicitudes_fotografo;
DROP POLICY IF EXISTS "Admins pueden ver todas las solicitudes" ON solicitudes_fotografo;
DROP POLICY IF EXISTS "Admins pueden actualizar solicitudes" ON solicitudes_fotografo;

-- 5. Crear políticas para fotógrafos
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

-- 6. Crear políticas para admins (permitir a todos los usuarios autenticados por ahora)
-- Nota: Ajusta estas políticas según tu tabla de usuarios y roles
CREATE POLICY "Admins pueden ver todas las solicitudes"
  ON solicitudes_fotografo
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins pueden actualizar solicitudes"
  ON solicitudes_fotografo
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 7. Trigger para actualizar updated_at
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

-- 8. Agregar campo fotografo_id a propiedades si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'propiedades' AND column_name = 'fotografo_id'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN fotografo_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- 9. Agregar campo imagenes a propiedades si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'propiedades' AND column_name = 'imagenes'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN imagenes TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 'Tabla solicitudes_fotografo creada' as status;
SELECT COUNT(*) as total_solicitudes FROM solicitudes_fotografo;
