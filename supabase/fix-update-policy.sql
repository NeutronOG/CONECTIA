-- Arreglar política de actualización y asignar propiedades

-- 1. Eliminar políticas antiguas que podrían estar causando conflictos (opcional pero recomendado)
DROP POLICY IF EXISTS "Solo admins y propietarios pueden actualizar propiedades" ON propiedades;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propias propiedades" ON propiedades;

-- 2. Crear la política correcta para UPDATE
CREATE POLICY "Usuarios pueden actualizar sus propias propiedades"
ON propiedades
FOR UPDATE
TO authenticated
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

-- 3. Asignar propiedades huérfanas al usuario actual (Reemplaza el email)
-- IMPORTANTE: Reemplaza 'tu-email@arkin.mx' con el email real del usuario
UPDATE propiedades 
SET usuario_id = (SELECT id FROM auth.users WHERE email = 'lizzie@arkin.mx')
WHERE usuario_id IS NULL;
