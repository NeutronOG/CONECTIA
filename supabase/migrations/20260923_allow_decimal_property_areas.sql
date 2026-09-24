ALTER TABLE propiedades
  ALTER COLUMN area TYPE NUMERIC USING area::NUMERIC,
  ALTER COLUMN area_construccion TYPE NUMERIC USING area_construccion::NUMERIC;
