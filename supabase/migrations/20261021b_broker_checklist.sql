-- La línea de tiempo del broker pasa a ser el checklist del expediente (lib/broker-checklist.ts).
-- checklist: { "<id_documento>": "YYYY-MM-DD" } con la fecha en que se palomeó cada documento.
ALTER TABLE broker_clientes ADD COLUMN IF NOT EXISTS checklist JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Conserva las columnas del flujo anterior por si contienen información histórica.
