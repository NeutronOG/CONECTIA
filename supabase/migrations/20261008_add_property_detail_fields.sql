-- Campos de detalle que el formulario de propiedades ya captura pero no se guardaban.
-- Ejecutar en Supabase SQL Editor. Es idempotente.

ALTER TABLE propiedades
  ADD COLUMN IF NOT EXISTS colonia TEXT,
  ADD COLUMN IF NOT EXISTS ciudad TEXT,
  ADD COLUMN IF NOT EXISTS frente NUMERIC,
  ADD COLUMN IF NOT EXISTS fondo NUMERIC,
  ADD COLUMN IF NOT EXISTS amueblado TEXT,
  ADD COLUMN IF NOT EXISTS antiguedad TEXT,
  ADD COLUMN IF NOT EXISTS gravamen TEXT,
  ADD COLUMN IF NOT EXISTS observaciones TEXT,
  ADD COLUMN IF NOT EXISTS amenidades TEXT[] DEFAULT '{}';

-- Refresca la caché de esquema de PostgREST para que la API vea las columnas.
NOTIFY pgrst, 'reload schema';

-- Galería con videos: el bucket sólo aceptaba imágenes de hasta 5MB.
-- 50MB es el límite por archivo del plan gratuito de Supabase.
UPDATE storage.buckets
SET
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/quicktime', 'video/webm'
  ],
  file_size_limit = 52428800
WHERE id = 'propiedades';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'propiedades'
  AND column_name IN ('colonia', 'ciudad', 'frente', 'fondo', 'amueblado', 'antiguedad', 'gravamen', 'observaciones', 'amenidades');
