-- =====================================================
-- CONFIGURACIÓN DE SUPABASE STORAGE PARA IMÁGENES
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Crear bucket para imágenes de propiedades
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'propiedades',
  'propiedades',
  true,
  5242880, -- 5MB límite
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Política para permitir lectura pública de imágenes
CREATE POLICY "Imagenes publicas" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'propiedades');

-- 3. Política para permitir subida de imágenes a usuarios autenticados
CREATE POLICY "Usuarios pueden subir imagenes" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'propiedades');

-- 4. Política para permitir subida anónima (para el formulario público)
CREATE POLICY "Subida anonima de imagenes" ON storage.objects
FOR INSERT TO anon
WITH CHECK (bucket_id = 'propiedades');

-- 5. Política para permitir eliminación de imágenes propias
CREATE POLICY "Usuarios pueden eliminar sus imagenes" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'propiedades');

-- 6. Aumentar timeout para consultas pesadas existentes
ALTER ROLE authenticator SET statement_timeout = '300s';
ALTER ROLE anon SET statement_timeout = '300s';

-- 7. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_propiedades_created_at ON propiedades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_propiedades_id ON propiedades(id);
