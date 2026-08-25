-- Agregar columna usuario_id a la tabla propiedades

-- 1. Agregar la columna usuario_id (foreign key a usuarios)
ALTER TABLE propiedades 
ADD COLUMN usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Crear índice para mejorar rendimiento de búsquedas
CREATE INDEX idx_propiedades_usuario_id ON propiedades(usuario_id);

-- 3. Opcional: Actualizar las propiedades existentes asignándolas a un usuario
-- (Reemplaza 'email-del-asesor@arkin.mx' con el email real del asesor)
-- UPDATE propiedades 
-- SET usuario_id = (SELECT id FROM auth.users WHERE email = 'lizzie@arkin.mx')
-- WHERE usuario_id IS NULL;
