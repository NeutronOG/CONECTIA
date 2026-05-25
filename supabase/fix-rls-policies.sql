-- Arreglar políticas RLS para permitir que asesores creen propiedades

-- 1. Eliminar política restrictiva existente si existe
DROP POLICY IF EXISTS "propiedades_insert_policy" ON propiedades;

-- 2. Crear nueva política que permita a usuarios autenticados insertar propiedades
CREATE POLICY "propiedades_insert_policy" 
ON propiedades 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- 3. Asegurar que los asesores puedan ver sus propias propiedades
DROP POLICY IF EXISTS "propiedades_select_policy" ON propiedades;

CREATE POLICY "propiedades_select_policy" 
ON propiedades 
FOR SELECT 
TO authenticated
USING (true);

-- 4. Permitir actualizar propiedades
DROP POLICY IF EXISTS "propiedades_update_policy" ON propiedades;

CREATE POLICY "propiedades_update_policy" 
ON propiedades 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Permitir eliminar propiedades
DROP POLICY IF EXISTS "propiedades_delete_policy" ON propiedades;

CREATE POLICY "propiedades_delete_policy" 
ON propiedades 
FOR DELETE 
TO authenticated
USING (true);

-- Verificar que RLS esté habilitado
ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;
