-- Corrige las dos causas que impedían publicar preventas:
-- 1) el CHECK histórico no aceptaba la categoría `preventa`;
-- 2) `bono` era NUMERIC aunque el formulario guarda un listón de texto.
-- También normaliza cualquier registro creado por la capa de compatibilidad
-- de la API antes de que esta migración llegara a la base.

BEGIN;

ALTER TABLE public.propiedades
  DROP CONSTRAINT IF EXISTS propiedades_categoria_check;

ALTER TABLE public.propiedades
  ADD COLUMN IF NOT EXISTS bono TEXT;

ALTER TABLE public.propiedades
  ALTER COLUMN bono TYPE TEXT USING bono::TEXT;

WITH category_markers AS (
  SELECT DISTINCT ON (p.id)
    p.id,
    marker,
    SUBSTRING(marker FROM CHAR_LENGTH('__conectia_internal_category__:') + 1) AS requested_category
  FROM public.propiedades AS p
  CROSS JOIN LATERAL UNNEST(COALESCE(p.caracteristicas, ARRAY[]::TEXT[])) AS marker
  WHERE LEFT(marker, CHAR_LENGTH('__conectia_internal_category__:')) = '__conectia_internal_category__:'
  ORDER BY p.id
)
UPDATE public.propiedades AS p
SET
  categoria = markers.requested_category,
  caracteristicas = ARRAY_REMOVE(p.caracteristicas, markers.marker)
FROM category_markers AS markers
WHERE p.id = markers.id
  AND markers.requested_category IN (
    'compra', 'venta', 'renta', 'oferta', 'especiales', 'preventa',
    'desarrollo', 'remate', 'especial', 'exclusivo'
  );

WITH bonus_markers AS (
  SELECT DISTINCT ON (p.id)
    p.id,
    marker,
    SUBSTRING(marker FROM CHAR_LENGTH('__conectia_internal_bonus__:') + 1) AS requested_bonus
  FROM public.propiedades AS p
  CROSS JOIN LATERAL UNNEST(COALESCE(p.caracteristicas, ARRAY[]::TEXT[])) AS marker
  WHERE LEFT(marker, CHAR_LENGTH('__conectia_internal_bonus__:')) = '__conectia_internal_bonus__:'
  ORDER BY p.id
)
UPDATE public.propiedades AS p
SET
  bono = COALESCE(NULLIF(p.bono, ''), markers.requested_bonus),
  caracteristicas = ARRAY_REMOVE(p.caracteristicas, markers.marker)
FROM bonus_markers AS markers
WHERE p.id = markers.id;

ALTER TABLE public.propiedades
  ADD CONSTRAINT propiedades_categoria_check
  CHECK (categoria IN (
    'compra', 'venta', 'renta', 'oferta', 'especiales', 'preventa',
    'desarrollo', 'remate', 'especial', 'exclusivo'
  ));

COMMIT;
