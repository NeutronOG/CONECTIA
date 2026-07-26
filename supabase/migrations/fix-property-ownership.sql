-- Corrección de guardado de propiedades: el UUID se guarda en usuario_id y el
-- correo se conserva por separado para las vistas de asesor.
ALTER TABLE public.propiedades
  ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS asesor_email TEXT;

CREATE INDEX IF NOT EXISTS idx_propiedades_usuario_id
  ON public.propiedades(usuario_id);

CREATE INDEX IF NOT EXISTS idx_propiedades_asesor_email
  ON public.propiedades(asesor_email);
