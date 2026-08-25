-- Migración: Agregar columna unidad_superficie a propiedades
-- Ejecutar esto en el SQL Editor de Supabase si la tabla ya existe

ALTER TABLE propiedades
ADD COLUMN IF NOT EXISTS unidad_superficie TEXT CHECK (unidad_superficie IN ('m²', 'Hectáreas')) DEFAULT 'm²';
