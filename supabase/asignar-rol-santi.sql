-- ============================================
-- ASIGNAR ROL DE FOTÓGRAFO A SANTI
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Actualizar el rol en la tabla users
UPDATE users 
SET role = 'fotografo' 
WHERE id = 'b35fabea-e58a-45b7-9a17-546ad28a1ea2';

-- Verificar que se actualizó correctamente
SELECT id, email, nombre, role 
FROM users 
WHERE id = 'b35fabea-e58a-45b7-9a17-546ad28a1ea2';
