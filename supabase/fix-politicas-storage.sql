-- ============================================
-- ARREGLAR POLÍTICAS DE STORAGE
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Eliminar políticas existentes del bucket solicitudes-fotografo
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir" ON storage.objects;
DROP POLICY IF EXISTS "Imágenes públicas" ON storage.objects;

-- 2. Crear política para INSERTAR (subir archivos)
-- Permitir a CUALQUIER usuario autenticado subir al bucket
CREATE POLICY "Usuarios autenticados pueden subir"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'solicitudes-fotografo');

-- 3. Crear política para SELECT (ver archivos)
-- Permitir a TODOS ver las imágenes (público)
CREATE POLICY "Imágenes públicas"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'solicitudes-fotografo');

-- 4. Crear política para DELETE (eliminar archivos)
-- Permitir a usuarios autenticados eliminar sus propios archivos
CREATE POLICY "Usuarios pueden eliminar sus archivos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'solicitudes-fotografo');

-- Verificar políticas creadas
SELECT 
  policyname as "Política",
  cmd as "Operación",
  roles as "Roles"
FROM pg_policies
WHERE tablename = 'objects'
  AND (qual LIKE '%solicitudes-fotografo%' OR with_check LIKE '%solicitudes-fotografo%')
ORDER BY policyname;
