-- ============================================
-- VERIFICAR NOMBRE DE TABLA DE USUARIOS
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Ver todas las tablas disponibles
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Ver estructura de auth.users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth';
