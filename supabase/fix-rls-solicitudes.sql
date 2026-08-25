-- ============================================
-- ARREGLAR RLS DE TABLA solicitudes_fotografo
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Opción 1: Deshabilitar RLS temporalmente para pruebas
-- DESCOMENTAR SOLO SI QUIERES DESHABILITAR RLS
-- ALTER TABLE solicitudes_fotografo DISABLE ROW LEVEL SECURITY;

-- Opción 2: Ajustar políticas para permitir inserción
-- Eliminar política existente
DROP POLICY IF EXISTS "Fotógrafos pueden crear solicitudes" ON solicitudes_fotografo;

-- Crear nueva política más permisiva
CREATE POLICY "Fotógrafos pueden crear solicitudes"
ON solicitudes_fotografo
FOR INSERT
TO authenticated
WITH CHECK (true);  -- Permitir a cualquier usuario autenticado

-- Verificar políticas
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
WHERE tablename = 'solicitudes_fotografo'
ORDER BY policyname;
