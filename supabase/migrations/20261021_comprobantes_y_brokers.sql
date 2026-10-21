-- Comprobantes de movimientos internos (solo administración y Lizzie)
CREATE TABLE IF NOT EXISTS comprobantes (
  id BIGSERIAL PRIMARY KEY,
  concepto TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'otro' CHECK (tipo IN ('ingreso', 'egreso', 'comision', 'transferencia', 'otro')),
  monto NUMERIC,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  notas TEXT NOT NULL DEFAULT '',
  archivo_path TEXT NOT NULL,
  archivo_nombre TEXT NOT NULL DEFAULT '',
  archivo_tipo TEXT NOT NULL DEFAULT '',
  subido_por_email TEXT NOT NULL,
  subido_por_nombre TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comprobantes_fecha ON comprobantes (fecha DESC);

-- Sin políticas: solo la API (service role) puede leer/escribir
ALTER TABLE comprobantes ENABLE ROW LEVEL SECURITY;

-- Bucket privado: los archivos solo se ven mediante URLs firmadas generadas por la API
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprobantes', 'comprobantes', false)
ON CONFLICT (id) DO NOTHING;

-- Clientes en proceso de crédito hipotecario, uno por broker
CREATE TABLE IF NOT EXISTS broker_clientes (
  id BIGSERIAL PRIMARY KEY,
  broker_email TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  cliente_email TEXT NOT NULL DEFAULT '',
  cliente_telefono TEXT NOT NULL DEFAULT '',
  propiedad TEXT NOT NULL DEFAULT '',
  monto_credito TEXT NOT NULL DEFAULT '',
  tipo_credito TEXT NOT NULL DEFAULT '',
  paso_actual INTEGER NOT NULL DEFAULT 1 CHECK (paso_actual BETWEEN 1 AND 7),
  documentos_vendedor JSONB NOT NULL DEFAULT '[]'::jsonb,
  notas TEXT NOT NULL DEFAULT '',
  notaria TEXT NOT NULL DEFAULT '',
  fecha_firma DATE,
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_broker_clientes_broker ON broker_clientes (broker_email, updated_at DESC);

ALTER TABLE broker_clientes ENABLE ROW LEVEL SECURITY;
