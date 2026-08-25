-- CONECTIA: identidades, permisos y confirmaciones para agentes externos.
-- Ejecutar una sola vez desde Supabase SQL Editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.agent_channel_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('telegram')),
  external_user_id TEXT NOT NULL,
  external_chat_id TEXT,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  scopes JSONB NOT NULL DEFAULT '{"properties":"own"}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (channel, external_user_id)
);

CREATE TABLE IF NOT EXISTS public.agent_pending_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID NOT NULL REFERENCES public.agent_channel_identities(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('update_property')),
  payload JSONB NOT NULL,
  summary TEXT NOT NULL,
  confirmation_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executing', 'confirmed', 'cancelled', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_identity_external
  ON public.agent_channel_identities(channel, external_user_id)
  WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_agent_pending_identity
  ON public.agent_pending_actions(identity_id, status, created_at DESC);

ALTER TABLE public.agent_channel_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_pending_actions ENABLE ROW LEVEL SECURITY;

-- No se crean políticas para anon/authenticated: solamente service_role accede
-- a estas tablas desde las rutas de servidor de CONECTIA.
REVOKE ALL ON public.agent_channel_identities FROM anon, authenticated;
REVOKE ALL ON public.agent_pending_actions FROM anon, authenticated;

-- Los permisos también viven en usuarios para que sean visibles desde el
-- perfil interno. Conserva cualquier permiso previo.
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS permisos TEXT[] NOT NULL DEFAULT '{}';

UPDATE public.usuarios
SET permisos = ARRAY(
  SELECT DISTINCT permission
  FROM unnest(
    COALESCE(permisos, '{}'::text[]) || ARRAY[
      'consultar_propiedades',
      'editar_propiedades',
      'consultar_plataforma',
      'ver_solicitudes_info'
    ]::text[]
  ) AS permission
),
updated_at = now()
WHERE lower(email) IN ('lizzie@conectia.mx', 'lizzie@arkin.mx');

-- Helper administrativo. Solo service_role puede invocarlo.
CREATE OR REPLACE FUNCTION public.link_conectia_telegram_identity(
  p_user_email TEXT,
  p_external_user_id TEXT,
  p_external_chat_id TEXT DEFAULT NULL,
  p_properties_scope TEXT DEFAULT 'own'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user public.usuarios%ROWTYPE;
  identity_id UUID;
BEGIN
  IF p_properties_scope NOT IN ('own', 'all') THEN
    RAISE EXCEPTION 'Alcance de propiedades inválido';
  END IF;

  SELECT * INTO target_user
  FROM public.usuarios
  WHERE lower(email) = lower(trim(p_user_email))
  LIMIT 1;

  IF target_user.id IS NULL THEN
    RAISE EXCEPTION 'Usuario CONECTIA no encontrado: %', p_user_email;
  END IF;

  INSERT INTO public.agent_channel_identities (
    user_id,
    channel,
    external_user_id,
    external_chat_id,
    permissions,
    scopes,
    active,
    updated_at
  )
  VALUES (
    target_user.id,
    'telegram',
    trim(p_external_user_id),
    nullif(trim(p_external_chat_id), ''),
    COALESCE(target_user.permisos, '{}'::text[]),
    jsonb_build_object('properties', p_properties_scope),
    true,
    now()
  )
  ON CONFLICT (channel, external_user_id)
  DO UPDATE SET
    user_id = EXCLUDED.user_id,
    external_chat_id = EXCLUDED.external_chat_id,
    permissions = EXCLUDED.permissions,
    scopes = EXCLUDED.scopes,
    active = true,
    updated_at = now()
  RETURNING id INTO identity_id;

  RETURN identity_id;
END;
$$;

REVOKE ALL ON FUNCTION public.link_conectia_telegram_identity(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_conectia_telegram_identity(TEXT, TEXT, TEXT, TEXT) TO service_role;

COMMENT ON TABLE public.agent_channel_identities IS
  'Vincula una identidad externa verificable con un usuario y permisos de CONECTIA.';
COMMENT ON TABLE public.agent_pending_actions IS
  'Acciones de escritura iniciadas por agentes que requieren confirmación humana y expiran.';

-- DESPUÉS de conocer los IDs numéricos reales de Telegram de Lizzie, ejecuta:
-- SELECT public.link_conectia_telegram_identity(
--   'lizzie@conectia.mx',
--   'TELEGRAM_USER_ID_DE_LIZZIE',
--   'TELEGRAM_CHAT_ID_DE_LIZZIE',
--   'all'
-- );
