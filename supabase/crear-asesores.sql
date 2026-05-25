-- ============================================
-- CREAR TODOS LOS ASESORES DE ARKIN
-- ============================================

-- PASO 1: Crear estos usuarios en Authentication → Users (uno por uno)
-- Todos con password: arkin2025 y Auto Confirm User marcado

/*
roberto@arkin.mx
maria@arkin.mx
daniela@arkin.mx
subje@arkin.mx
gris@arkin.mx
lizzie@arkin.mx
ingrid@arkin.mx
sofia.ayala@arkin.mx
*/

-- PASO 2: Después de crear los usuarios arriba, ejecuta este SQL:

INSERT INTO usuarios (id, email, nombre, role, telefono)
SELECT 
  au.id,
  au.email,
  CASE au.email
    WHEN 'roberto@arkin.mx' THEN 'Roberto Silva'
    WHEN 'maria@arkin.mx' THEN 'María López'
    WHEN 'daniela@arkin.mx' THEN 'Daniela Belmonte'
    WHEN 'subje@arkin.mx' THEN 'Subje Hamue'
    WHEN 'gris@arkin.mx' THEN 'Gris Ayala'
    WHEN 'lizzie@arkin.mx' THEN 'Lizzie Lazarini'
    WHEN 'ingrid@arkin.mx' THEN 'Ingrid Gonzalez'
    WHEN 'sofia.ayala@arkin.mx' THEN 'Sofía Ayala'
  END as nombre,
  'asesor' as role,
  CASE au.email
    WHEN 'roberto@arkin.mx' THEN '+52 477 234 5678'
    WHEN 'maria@arkin.mx' THEN '+52 477 345 6789'
    WHEN 'daniela@arkin.mx' THEN '+52 477 456 7801'
    WHEN 'subje@arkin.mx' THEN '+52 477 456 7802'
    WHEN 'gris@arkin.mx' THEN '+52 477 456 7803'
    WHEN 'lizzie@arkin.mx' THEN '+52 477 456 7804'
    WHEN 'ingrid@arkin.mx' THEN '+52 477 456 7805'
    WHEN 'sofia.ayala@arkin.mx' THEN '+52 477 456 7806'
  END as telefono
FROM auth.users au
WHERE au.email IN (
  'roberto@arkin.mx',
  'maria@arkin.mx',
  'daniela@arkin.mx',
  'subje@arkin.mx',
  'gris@arkin.mx',
  'lizzie@arkin.mx',
  'ingrid@arkin.mx',
  'sofia.ayala@arkin.mx'
)
ON CONFLICT (id) DO NOTHING;

-- Verificar todos los asesores
SELECT email, nombre, role FROM usuarios WHERE role = 'asesor' ORDER BY nombre;
