-- ============================================
-- CREAR USUARIOS DE PRUEBA - EJECUTA ESTE SQL
-- ============================================

-- Paso 1: Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Paso 2: Crear función helper
CREATE OR REPLACE FUNCTION create_test_user(
  user_email TEXT,
  user_password TEXT,
  user_name TEXT,
  user_role TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  new_user_id := uuid_generate_v4();
  
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    FALSE,
    'authenticated',
    'authenticated'
  ) ON CONFLICT (email) DO NOTHING;
  
  INSERT INTO usuarios (id, email, nombre, role)
  VALUES (new_user_id, user_email, user_name, user_role)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new_user_id;
END;
$$;

-- Paso 3: Crear los 3 usuarios
SELECT create_test_user('admin@arkin.mx', 'arkin2025', 'Admin Arkin', 'admin');
SELECT create_test_user('ana@arkin.mx', 'arkin2025', 'Ana Asesor', 'asesor');
SELECT create_test_user('eduardo@propietario.com', 'arkin2025', 'Eduardo Propietario', 'propietario');

-- Paso 4: Verificar
SELECT email, nombre, role FROM usuarios;
