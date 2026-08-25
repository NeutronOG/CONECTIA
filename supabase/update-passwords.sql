-- ============================================
-- ACTUALIZAR CONTRASEÑAS EN SUPABASE AUTH
-- ============================================
-- Ejecuta este SQL en Supabase SQL Editor

-- Función para actualizar contraseña
CREATE OR REPLACE FUNCTION update_user_password(
  user_email TEXT,
  new_password TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Obtener el ID del usuario
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado: %', user_email;
  END IF;
  
  -- Actualizar la contraseña
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = user_id;
  
  RAISE NOTICE 'Contraseña actualizada para: %', user_email;
END;
$$;

-- Actualizar contraseñas de asesores
SELECT update_user_password('ana@arkin.mx', 'ana_arkin2025');
SELECT update_user_password('roberto@arkin.mx', 'roberto_arkin2025');
SELECT update_user_password('maria@arkin.mx', 'maria_arkin2025');
SELECT update_user_password('daniela@arkin.mx', 'daniela_arkin2025');
SELECT update_user_password('subje@arkin.mx', 'subje_arkin2025');
SELECT update_user_password('gris@arkin.mx', 'gris_arkin2025');
SELECT update_user_password('lizzie@arkin.mx', 'lizzie_arkin2025');
SELECT update_user_password('ingrid@arkin.mx', 'ingrid_arkin2025');
SELECT update_user_password('sofia.ayala@arkin.mx', 'sofia_arkin2025');

-- Actualizar contraseñas de propietarios (si existen en auth)
SELECT update_user_password('eduardo@propietario.com', 'arkin2025');
SELECT update_user_password('sofia@propietario.com', 'arkin2025');
SELECT update_user_password('ricardo@propietario.com', 'arkin2025');

-- Verificar que se actualizaron
SELECT email FROM auth.users WHERE email IN (
  'ana@arkin.mx',
  'roberto@arkin.mx',
  'maria@arkin.mx',
  'daniela@arkin.mx',
  'subje@arkin.mx',
  'gris@arkin.mx',
  'lizzie@arkin.mx',
  'ingrid@arkin.mx',
  'sofia.ayala@arkin.mx',
  'eduardo@propietario.com',
  'sofia@propietario.com',
  'ricardo@propietario.com'
);
