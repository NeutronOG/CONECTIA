-- ============================================
-- CREAR USUARIOS DE PRUEBA EN SUPABASE
-- ============================================
-- IMPORTANTE: Primero crear los usuarios en Authentication, luego ejecutar este SQL

-- PASO 1: Ve a Authentication → Users → Add User (hazlo 3 veces)
-- Usuario 1: admin@arkin.mx / arkin2025
-- Usuario 2: ana@arkin.mx / arkin2025  
-- Usuario 3: eduardo@propietario.com / arkin2025

-- PASO 2: Copia los UUIDs generados y reemplázalos abajo

-- ============================================
-- Opción A: Si ya creaste los usuarios manualmente
-- ============================================
-- Reemplaza los UUIDs con los que te generó Supabase:

INSERT INTO usuarios (id, email, nombre, role) VALUES
('REEMPLAZA-CON-UUID-ADMIN', 'admin@arkin.mx', 'Admin Arkin', 'admin'),
('REEMPLAZA-CON-UUID-ASESOR', 'ana@arkin.mx', 'Ana Asesor', 'asesor'),
('REEMPLAZA-CON-UUID-PROPIETARIO', 'eduardo@propietario.com', 'Eduardo Propietario', 'propietario')
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- Opción B: AUTOMÁTICO (Recomendado)
-- ============================================
-- Este script crea los usuarios automáticamente usando las extensiones de Supabase

-- Primero, verifica que tengas la extensión necesaria
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Función helper para crear usuario con auth
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
  -- Generar UUID
  new_user_id := uuid_generate_v4();
  
  -- Insertar en auth.users (tabla de Supabase Auth)
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
  
  -- Insertar en usuarios (nuestra tabla custom)
  INSERT INTO usuarios (id, email, nombre, role)
  VALUES (new_user_id, user_email, user_name, user_role)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new_user_id;
END;
$$;

-- Crear los 3 usuarios de prueba
SELECT create_test_user('admin@arkin.mx', 'arkin2025', 'Admin Arkin', 'admin');
SELECT create_test_user('ana@arkin.mx', 'arkin2025', 'Ana Asesor', 'asesor');
SELECT create_test_user('eduardo@propietario.com', 'arkin2025', 'Eduardo Propietario', 'propietario');

-- Verificar que se crearon
SELECT email, nombre, role FROM usuarios;


-- ============================================
-- SOLUCIÓN SI EL SCRIPT AUTOMÁTICO NO FUNCIONA
-- ============================================
-- Si el script automático da error, usa este método simplificado:

/*
1. Ve a Supabase Dashboard → Authentication → Users
2. Click "Add User" (hazlo 3 veces):
   - Email: admin@arkin.mx, Password: arkin2025
   - Email: ana@arkin.mx, Password: arkin2025
   - Email: eduardo@propietario.com, Password: arkin2025

3. Después de crear cada uno, COPIA su UUID

4. Ejecuta esto reemplazando los UUIDs:

INSERT INTO usuarios (id, email, nombre, role) VALUES
('PEGAR-UUID-DE-ADMIN-AQUI', 'admin@arkin.mx', 'Admin Arkin', 'admin'),
('PEGAR-UUID-DE-ANA-AQUI', 'ana@arkin.mx', 'Ana Asesor', 'asesor'),
('PEGAR-UUID-DE-EDUARDO-AQUI', 'eduardo@propietario.com', 'Eduardo Propietario', 'propietario');
*/
