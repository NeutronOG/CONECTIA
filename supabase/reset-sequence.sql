-- Resetear la secuencia de IDs de la tabla propiedades

-- 1. Ver el ID máximo actual en la tabla
SELECT MAX(id) FROM propiedades;

-- 2. Resetear la secuencia al siguiente valor disponible
-- Esto asegura que los nuevos IDs no entren en conflicto con los existentes
SELECT setval('propiedades_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM propiedades), false);

-- 3. Verificar el siguiente valor de la secuencia
SELECT nextval('propiedades_id_seq');
