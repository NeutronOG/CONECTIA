-- Columnas del pipeline bancario (hoja "Pipeline Ara Brokers") que usa Armando.
-- Cliente, monto aprobado, notaría y fecha de firma ya existen en broker_clientes.
ALTER TABLE broker_clientes
  ADD COLUMN IF NOT EXISTS banco TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS avaluo TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS vencimiento DATE,
  -- Bandeja del cliente: pipeline (etapas en checklist.etapa_*), pendiente formato o pendiente
  ADD COLUMN IF NOT EXISTS estatus TEXT NOT NULL DEFAULT 'pipeline'
    CHECK (estatus IN ('pipeline', 'pendiente_formato', 'pendiente'));

NOTIFY pgrst, 'reload schema';
