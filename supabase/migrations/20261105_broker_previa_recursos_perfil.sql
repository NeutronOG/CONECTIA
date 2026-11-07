-- Etapa previa a la autorización (lib/broker-previa.ts): observaciones, documentación
-- faltante, subsanaciones y coacreditados. Bandeja nueva `previa` en el pipeline bancario.
ALTER TABLE broker_clientes
  ADD COLUMN IF NOT EXISTS pre_autorizacion JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE broker_clientes DROP CONSTRAINT IF EXISTS broker_clientes_estatus_check;
ALTER TABLE broker_clientes ADD CONSTRAINT broker_clientes_estatus_check
  CHECK (estatus IN ('previa', 'pipeline', 'pendiente_formato', 'pendiente'));

-- Módulo privado: formatos, información y tabuladores de cada broker (archivo o liga)
CREATE TABLE IF NOT EXISTS broker_recursos (
  id BIGSERIAL PRIMARY KEY,
  broker_email TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'formato' CHECK (categoria IN ('formato', 'informacion', 'tabulador')),
  banco TEXT NOT NULL DEFAULT '',
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  liga TEXT NOT NULL DEFAULT '',
  archivo_path TEXT NOT NULL DEFAULT '',
  archivo_nombre TEXT NOT NULL DEFAULT '',
  archivo_tipo TEXT NOT NULL DEFAULT '',
  vigente_hasta DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_broker_recursos_broker ON broker_recursos (broker_email, created_at DESC);

-- Perfil profesional del broker
CREATE TABLE IF NOT EXISTS broker_perfiles (
  broker_email TEXT PRIMARY KEY,
  nombre_completo TEXT NOT NULL DEFAULT '',
  cargo TEXT NOT NULL DEFAULT '',
  empresa TEXT NOT NULL DEFAULT '',
  telefono TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  correo_contacto TEXT NOT NULL DEFAULT '',
  semblanza TEXT NOT NULL DEFAULT '',
  foto_path TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Sin políticas: solo la API (service role) puede leer/escribir
ALTER TABLE broker_recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_perfiles ENABLE ROW LEVEL SECURITY;

-- Bucket privado: los archivos solo se ven mediante URLs firmadas generadas por la API
INSERT INTO storage.buckets (id, name, public)
VALUES ('broker-recursos', 'broker-recursos', false)
ON CONFLICT (id) DO NOTHING;

NOTIFY pgrst, 'reload schema';
