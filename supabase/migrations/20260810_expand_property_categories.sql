-- Las categorías guardadas por el asesor coinciden con las secciones públicas
-- de Explorar. Se conservan `especial` y `exclusivo` para publicaciones previas.
ALTER TABLE public.propiedades
  DROP CONSTRAINT IF EXISTS propiedades_categoria_check;

ALTER TABLE public.propiedades
  ADD CONSTRAINT propiedades_categoria_check
  CHECK (categoria IN (
    'compra', 'venta', 'renta', 'oferta', 'especiales', 'preventa',
    'desarrollo', 'remate', 'especial', 'exclusivo'
  ));
