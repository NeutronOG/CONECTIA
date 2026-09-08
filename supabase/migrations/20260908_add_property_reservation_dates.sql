-- Fechas de apartado y vencimiento de contrato visibles en el panel del asesor.
ALTER TABLE propiedades
  ADD COLUMN IF NOT EXISTS fecha_apartado DATE,
  ADD COLUMN IF NOT EXISTS fecha_termino_contrato DATE;

CREATE INDEX IF NOT EXISTS idx_propiedades_fecha_termino_contrato
  ON propiedades (fecha_termino_contrato)
  WHERE fecha_termino_contrato IS NOT NULL;
