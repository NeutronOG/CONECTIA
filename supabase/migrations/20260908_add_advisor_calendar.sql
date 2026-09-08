CREATE TABLE IF NOT EXISTS calendario (
  id BIGSERIAL PRIMARY KEY,
  asesor_email TEXT NOT NULL,
  asesor_nombre TEXT NOT NULL DEFAULT '',
  titulo TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL DEFAULT '09:00',
  tipo TEXT NOT NULL DEFAULT 'otro',
  descripcion TEXT NOT NULL DEFAULT '',
  meses_antes INTEGER NOT NULL DEFAULT 3 CHECK (meses_antes BETWEEN 0 AND 12),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE calendario ADD COLUMN IF NOT EXISTS asesor_email TEXT;
ALTER TABLE calendario ADD COLUMN IF NOT EXISTS asesor_nombre TEXT NOT NULL DEFAULT '';
ALTER TABLE calendario ADD COLUMN IF NOT EXISTS titulo TEXT;
ALTER TABLE calendario ADD COLUMN IF NOT EXISTS hora TIME NOT NULL DEFAULT '09:00';
ALTER TABLE calendario ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'otro';
ALTER TABLE calendario ADD COLUMN IF NOT EXISTS descripcion TEXT NOT NULL DEFAULT '';
ALTER TABLE calendario ADD COLUMN IF NOT EXISTS meses_antes INTEGER NOT NULL DEFAULT 3;

CREATE INDEX IF NOT EXISTS idx_calendario_asesor_fecha ON calendario (asesor_email, fecha);
CREATE UNIQUE INDEX IF NOT EXISTS idx_calendario_seed_events
  ON calendario (asesor_email, titulo, fecha);

INSERT INTO calendario (asesor_email, asesor_nombre, titulo, fecha, hora, tipo, descripcion, meses_antes)
VALUES
  ('lizzie@conectia.mx', 'Lizzie', 'Portones', '2026-05-16', '09:00', 'otro', 'Recordar 3 meses antes.', 3),
  ('lizzie@conectia.mx', 'Lizzie', 'Arbide', '2026-08-19', '09:00', 'otro', 'Recordar 3 meses antes.', 3)
ON CONFLICT (asesor_email, titulo, fecha) DO UPDATE
SET meses_antes = EXCLUDED.meses_antes,
    descripcion = EXCLUDED.descripcion;
