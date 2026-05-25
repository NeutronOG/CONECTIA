-- ============================================
-- DESHABILITAR RLS TEMPORALMENTE
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Deshabilitar RLS en la tabla solicitudes_fotografo
ALTER TABLE solicitudes_fotografo DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'solicitudes_fotografo';
