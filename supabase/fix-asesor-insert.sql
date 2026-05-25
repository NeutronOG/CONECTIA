-- ============================================
-- SOLUCIÓN: Permitir que asesores publiquen propiedades
-- ============================================
-- Ejecuta este SQL en Supabase SQL Editor

-- 1. Agregar columna usuario_id a propiedades (si no existe)
ALTER TABLE propiedades 
ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id);

-- 2. Crear índice para usuario_id
CREATE INDEX IF NOT EXISTS idx_propiedades_usuario ON propiedades(usuario_id);

-- 3. Eliminar políticas antiguas de INSERT/UPDATE
DROP POLICY IF EXISTS "Solo admins y propietarios pueden insertar propiedades" ON propiedades;
DROP POLICY IF EXISTS "Solo admins y propietarios pueden actualizar propiedades" ON propiedades;
DROP POLICY IF EXISTS "Asesores pueden insertar propiedades" ON propiedades;
DROP POLICY IF EXISTS "Asesores pueden actualizar sus propiedades" ON propiedades;

-- 4. Crear nueva política para INSERT (admins, propietarios Y asesores)
CREATE POLICY "Usuarios autenticados pueden insertar propiedades" ON propiedades
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'propietario', 'asesor')
        )
    );

-- 5. Crear nueva política para UPDATE (propietario de la propiedad o admin)
CREATE POLICY "Usuarios pueden actualizar sus propiedades" ON propiedades
    FOR UPDATE USING (
        usuario_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 6. Verificar que las políticas están activas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'propiedades';
