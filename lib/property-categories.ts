/**
 * Catálogo único para las categorías públicas de una propiedad.
 * El valor se persiste en `propiedades.categoria`; la etiqueta y la ruta son
 * las que ve el cliente en el menú Explorar.
 */
export const PUBLIC_PROPERTY_CATEGORIES = [
  { value: 'compra', label: 'Comprar', href: '/compra' },
  { value: 'venta', label: 'Vender', href: '/venta' },
  { value: 'renta', label: 'Renta', href: '/renta' },
  { value: 'oferta', label: 'Ofertas', href: '/ofertas' },
  { value: 'especiales', label: 'Especiales', href: '/especiales' },
  { value: 'preventa', label: 'Preventa', href: '/preventa' },
  { value: 'desarrollo', label: 'Desarrollos', href: '/desarrollos' },
  { value: 'remate', label: 'Remates Judiciales', href: '/remates' },
] as const

export type PublicPropertyCategory = (typeof PUBLIC_PROPERTY_CATEGORIES)[number]['value']

// También se aceptan estas claves para que las publicaciones históricas no
// desaparezcan al migrar al nuevo catálogo.
export const LEGACY_PROPERTY_CATEGORIES = ['especial', 'exclusivo'] as const

export type PropertyCategory = PublicPropertyCategory | (typeof LEGACY_PROPERTY_CATEGORIES)[number]

export function isPropertyCategory(value: unknown): value is PropertyCategory {
  return typeof value === 'string' && [
    ...PUBLIC_PROPERTY_CATEGORIES.map((category) => category.value),
    ...LEGACY_PROPERTY_CATEGORIES,
  ].includes(value as PropertyCategory)
}
