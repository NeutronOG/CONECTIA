-- Script para restringir la eliminación de propiedades solo a administradores

-- 1. Eliminar la política de DELETE existente
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propias propiedades" ON propiedades;
DROP POLICY IF EXISTS "Solo admins pueden eliminar propiedades" ON propiedades;

-- 2. Crear nueva política: SOLO administradores pueden eliminar propiedades
CREATE POLICY "Solo administradores pueden eliminar propiedades"
ON propiedades
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.role = 'admin'
  )
);

-- 3. Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Política actualizada: Solo administradores pueden eliminar propiedades.';
END $$;
