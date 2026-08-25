-- ============================================
-- FIX FINAL - PERMISOS DE STORAGE Y TABLA
-- EJECUTAR TODO ESTE SCRIPT EN SUPABASE SQL EDITOR
-- ============================================

-- PASO 1: Deshabilitar RLS en solicitudes_fotografo
ALTER TABLE solicitudes_fotografo DISABLE ROW LEVEL SECURITY;

-- PASO 2: Eliminar TODAS las políticas de storage.objects para este bucket
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
    ) 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

-- PASO 3: Crear política ÚNICA y PERMISIVA para storage
CREATE POLICY "allow_all_storage_operations"
ON storage.objects
FOR ALL
USING (true)
WITH CHECK (true);

-- PASO 4: Verificar que todo está correcto
SELECT 'Tabla solicitudes_fotografo - RLS:' as verificacion, 
       CASE WHEN rowsecurity THEN 'HABILITADO (PROBLEMA)' ELSE 'DESHABILITADO (OK)' END as estado
FROM pg_tables 
WHERE tablename = 'solicitudes_fotografo';

SELECT 'Políticas de storage.objects:' as verificacion, COUNT(*) as cantidad
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
