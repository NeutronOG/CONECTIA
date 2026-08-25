-- Migración: agregar columna de comisión total elegida por el asesor
-- Ejecutar en Supabase Dashboard > SQL Editor

ALTER TABLE propiedades
ADD COLUMN IF NOT EXISTS comision_asesor_pct NUMERIC DEFAULT 4;

COMMENT ON COLUMN propiedades.comision_asesor_pct IS 'Porcentaje total de comisión elegido por el asesor (1-6). La mitad es para el asesor y la otra mitad para CONECTIA.';
