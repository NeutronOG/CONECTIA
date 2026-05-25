# SQL para Sistema de Solicitudes de Fotógrafo

## Ejecutar en Supabase SQL Editor

```sql
-- Crear tabla de solicitudes de propiedades del fotógrafo
CREATE TABLE IF NOT EXISTS solicitudes_fotografo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fotografo_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  ubicacion TEXT NOT NULL,
  descripcion TEXT,
  precio_estimado NUMERIC,
  imagenes TEXT[] DEFAULT '{}', -- Array de URLs de Supabase Storage
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobada', 'rechazada')),
  notas_admin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  aprobada_por UUID REFERENCES auth.users(id),
  aprobada_at TIMESTAMP WITH TIME ZONE
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_solicitudes_fotografo_id ON solicitudes_fotografo(fotografo_id);
CREATE INDEX idx_solicitudes_status ON solicitudes_fotografo(status);
CREATE INDEX idx_solicitudes_created_at ON solicitudes_fotografo(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE solicitudes_fotografo ENABLE ROW LEVEL SECURITY;

-- Política: Fotógrafos pueden ver y crear sus propias solicitudes
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

-- Política: Admins pueden ver y actualizar todas las solicitudes
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

CREATE TRIGGER update_solicitudes_fotografo_updated_at
  BEFORE UPDATE ON solicitudes_fotografo
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Configuración de Storage

1. **Crear bucket** (si no existe): `solicitudes-fotografo`
2. **Configurar como público** para las URLs
3. **Políticas de Storage**:

```sql
-- Política: Fotógrafos pueden subir imágenes
CREATE POLICY "Fotógrafos pueden subir imágenes"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'solicitudes-fotografo' AND
    auth.role() = 'authenticated'
  );

-- Política: Todos pueden ver imágenes
CREATE POLICY "Imágenes públicas"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'solicitudes-fotografo');

-- Política: Fotógrafos pueden eliminar sus imágenes
CREATE POLICY "Fotógrafos pueden eliminar sus imágenes"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'solicitudes-fotografo' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```
