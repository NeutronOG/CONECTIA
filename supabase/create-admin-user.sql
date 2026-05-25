-- ============================================
-- CREAR USUARIO ADMIN EN SUPABASE AUTH
-- ============================================
-- Ejecuta este SQL en Supabase SQL Editor

DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- Generar UUID para el admin
  admin_id := gen_random_uuid();
  
  -- Crear usuario admin en auth.users
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  )
  VALUES (
    admin_id,
    'admin@arkin.mx',
    crypt('arkin2025', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"nombre":"Carlos Mendoza","role":"admin"}',
    false,
    'authenticated'
  );

  -- Crear entrada en tabla usuarios con el mismo ID
  INSERT INTO public.usuarios (
    id,
    email,
    nombre,
    role,
    created_at
  )
  VALUES (
    admin_id,
    'admin@arkin.mx',
    'Carlos Mendoza',
    'admin',
    now()
  );
END $$;
