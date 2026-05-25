-- ============================================
-- ARREGLAR TODOS LOS PERMISOS
-- Ejecutar TODO este script en Supabase SQL Editor
-- ============================================

-- 1. DESHABILITAR RLS en tabla solicitudes_fotografo
ALTER TABLE solicitudes_fotografo DISABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR todas las políticas antiguas de storage
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir" ON storage.objects;
DROP POLICY IF EXISTS "Imágenes públicas" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus archivos" ON storage.objects;

-- 3. CREAR políticas de storage correctas
CREATE POLICY "Allow authenticated uploads to solicitudes-fotografo"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'solicitudes-fotografo');

CREATE POLICY "Allow public access to solicitudes-fotografo"
ON storage.objects
FOR SELECT
TO public, authenticated
USING (bucket_id = 'solicitudes-fotografo');

CREATE POLICY "Allow authenticated deletes from solicitudes-fotografo"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'solicitudes-fotografo');

-- 4. VERIFICAR configuración
SELECT 'RLS Status:' as check_type, 
       CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_tables
WHERE tablename = 'solicitudes_fotografo'
UNION ALL
SELECT 'Storage Policies:', COUNT(*)::text
FROM pg_policies
WHERE tablename = 'objects' 
  AND (qual LIKE '%solicitudes-fotografo%' OR with_check LIKE '%solicitudes-fotografo%');
