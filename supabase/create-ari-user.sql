-- Crear usuario Ari en Supabase Auth y tabla usuarios
-- Ejecutar en el SQL Editor de Supabase

-- Primero crear el usuario en auth.users (esto normalmente se hace via API, pero aquí está el SQL de referencia)
-- Nota: En producción usar la API o el Dashboard de Supabase para crear usuarios

-- Insertar en la tabla usuarios (si usas una tabla personalizada)
INSERT INTO usuarios (id, email, nombre, role, telefono, avatar, permisos, es_editor_principal)
VALUES (
    gen_random_uuid(),
    'ari@conectia.mx',
    'Ari',
    'admin',
    '563-157-2468',
    '/avatars/ari.jpg',
    ARRAY['editar_propiedades', 'subir_propiedades', 'bajar_propiedades', 'ver_logs'],
    true
)
ON CONFLICT (email) DO UPDATE SET
    nombre = 'Ari',
    role = 'admin',
    telefono = '563-157-2468',
    avatar = '/avatars/ari.jpg',
    permisos = ARRAY['editar_propiedades', 'subir_propiedades', 'bajar_propiedades', 'ver_logs'],
    es_editor_principal = true;

-- Nota: La contraseña debe establecerse via Supabase Dashboard o API
-- Password: ari_conectia2025
