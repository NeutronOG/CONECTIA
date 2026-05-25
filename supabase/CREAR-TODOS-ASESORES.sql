-- ============================================
-- CREAR TODOS LOS ASESORES AUTOMÁTICAMENTE
-- COPIA Y PEGA TODO ESTE CÓDIGO EN SUPABASE SQL EDITOR
-- ============================================

-- Habilitar extensión
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Función para crear usuario completo
CREATE OR REPLACE FUNCTION create_asesor(
  user_email TEXT,
  user_name TEXT,
  user_phone TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  new_user_id := uuid_generate_v4();
  
  -- Insertar en auth.users
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
    crypt('arkin2025', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    FALSE,
    'authenticated',
    'authenticated'
  ) ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email RETURNING id INTO new_user_id;
  
  -- Insertar en usuarios
  INSERT INTO usuarios (id, email, nombre, role, telefono)
  VALUES (new_user_id, user_email, user_name, 'asesor', user_phone)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new_user_id;
END;
$$;

-- Crear todos los asesores
SELECT create_asesor('roberto@arkin.mx', 'Roberto Silva', '+52 477 234 5678');
SELECT create_asesor('maria@arkin.mx', 'María López', '+52 477 345 6789');
SELECT create_asesor('daniela@arkin.mx', 'Daniela Belmonte', '+52 477 456 7801');
SELECT create_asesor('subje@arkin.mx', 'Subje Hamue', '+52 477 456 7802');
SELECT create_asesor('gris@arkin.mx', 'Gris Ayala', '+52 477 456 7803');
SELECT create_asesor('lizzie@arkin.mx', 'Lizzie Lazarini', '+52 477 456 7804');
SELECT create_asesor('ingrid@arkin.mx', 'Ingrid Gonzalez', '+52 477 456 7805');
SELECT create_asesor('sofia.ayala@arkin.mx', 'Sofía Ayala', '+52 477 456 7806');

-- Verificar que se crearon todos
SELECT email, nombre, telefono FROM usuarios WHERE role = 'asesor' ORDER BY nombre;
