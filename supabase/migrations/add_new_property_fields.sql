-- Agregar nuevos campos a la tabla propiedades
-- Ejecutar en Supabase SQL Editor

-- Medios baños
ALTER TABLE propiedades 
ADD COLUMN IF NOT EXISTS medios_banos INTEGER DEFAULT 0;

-- Área de construcción
ALTER TABLE propiedades 
ADD COLUMN IF NOT EXISTS area_construccion INTEGER DEFAULT 0;

-- Cochera (número de coches)
ALTER TABLE propiedades 
ADD COLUMN IF NOT EXISTS cochera INTEGER DEFAULT 0;

-- Verificar que las columnas se agregaron
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'propiedades' 
AND column_name IN ('medios_banos', 'area_construccion', 'cochera');
