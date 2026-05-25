-- ============================================
-- ACTUALIZAR EMAIL DE SANTI EN SUPABASE AUTH
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Actualizar el email del usuario Santi para que coincida con internal-users.ts
UPDATE auth.users 
SET email = 'santiago@arkin.mx',
    raw_user_meta_data = jsonb_build_object(
      'email', 'santiago@arkin.mx',
      'role', 'fotografo',
      'nombre', 'Santiago Canales'
    )
WHERE id = 'b35fabea-e58a-45b7-9a17-546ad28a1ea2';

-- Verificar que se actualizó
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE id = 'b35fabea-e58a-45b7-9a17-546ad28a1ea2';
