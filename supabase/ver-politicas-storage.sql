-- ============================================
-- VER POLÍTICAS DE STORAGE
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Ver todas las políticas de storage.objects
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;

-- Ver políticas específicas del bucket solicitudes-fotografo
SELECT 
  policyname as "Nombre de Política",
  cmd as "Operación",
  roles as "Roles",
  qual as "Condición USING",
  with_check as "Condición WITH CHECK"
FROM pg_policies
WHERE tablename = 'objects'
  AND (qual LIKE '%solicitudes-fotografo%' OR with_check LIKE '%solicitudes-fotografo%')
ORDER BY policyname;
