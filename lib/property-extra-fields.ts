import type { Propiedad } from '@/data/propiedades'

type PropertyRecord = Record<string, any>

/**
 * Columnas agregadas en supabase/migrations/20261008_add_property_detail_fields.sql.
 * Mientras una instalación no ejecute la migración, la API las descarta para
 * que el guardado del resto de la propiedad no falle.
 */
export const EXTRA_PROPERTY_COLUMNS = [
  'colonia', 'ciudad', 'frente', 'fondo', 'amueblado',
  'antiguedad', 'gravamen', 'observaciones', 'amenidades',
] as const

const textOrUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined

const numberOrUndefined = (value: unknown) => {
  if (value === null || value === undefined || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

/** Convierte las columnas nuevas de una fila de Supabase al formato de la app. */
export function extraFieldsFromRow(row: PropertyRecord): Partial<Propiedad> {
  return {
    colonia: textOrUndefined(row.colonia),
    ciudad: textOrUndefined(row.ciudad),
    frente: numberOrUndefined(row.frente),
    fondo: numberOrUndefined(row.fondo),
    amueblado: textOrUndefined(row.amueblado) as Propiedad['amueblado'],
    antiguedad: textOrUndefined(row.antiguedad),
    gravamen: textOrUndefined(row.gravamen),
    observaciones: textOrUndefined(row.observaciones),
    amenidades: Array.isArray(row.amenidades) ? row.amenidades.filter((a: unknown) => typeof a === 'string') : undefined,
  }
}

/** Convierte los campos nuevos de la app a columnas; sólo incluye los presentes en `source`. */
export function extraFieldsToRow(source: Partial<Propiedad>): PropertyRecord {
  const row: PropertyRecord = {}
  const has = (field: keyof Propiedad) => Object.prototype.hasOwnProperty.call(source, field)

  if (has('colonia')) row.colonia = textOrUndefined(source.colonia) ?? null
  if (has('ciudad')) row.ciudad = textOrUndefined(source.ciudad) ?? null
  if (has('frente')) row.frente = numberOrUndefined(source.frente) ?? null
  if (has('fondo')) row.fondo = numberOrUndefined(source.fondo) ?? null
  if (has('amueblado')) row.amueblado = textOrUndefined(source.amueblado) ?? null
  if (has('antiguedad')) row.antiguedad = textOrUndefined(source.antiguedad) ?? null
  if (has('gravamen')) row.gravamen = textOrUndefined(source.gravamen) ?? null
  if (has('observaciones')) row.observaciones = textOrUndefined(source.observaciones) ?? null
  if (has('amenidades')) row.amenidades = source.amenidades || []

  return row
}

/** PostgREST responde PGRST204 cuando el payload trae una columna que la tabla no tiene. */
export function isMissingExtraColumnError(error: { code?: string; message?: string } | null) {
  if (!error) return false
  const message = error.message || ''
  return (error.code === 'PGRST204' || /column/i.test(message))
    && EXTRA_PROPERTY_COLUMNS.some((column) => message.includes(`'${column}'`) || message.includes(`"${column}"`))
}

export function withoutExtraColumns(record: PropertyRecord) {
  const copy = { ...record }
  EXTRA_PROPERTY_COLUMNS.forEach((column) => delete copy[column])
  return copy
}

/** Dirección pública con colonia y ciudad, sin repetir partes ya incluidas en `ubicacion`. */
export function formatPropertyLocation(property: Pick<Propiedad, 'ubicacion'> & Partial<Pick<Propiedad, 'colonia' | 'ciudad'>>) {
  const base = (property.ubicacion || '').trim()
  const lower = base.toLowerCase()
  const extras = [property.colonia, property.ciudad]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part) && !lower.includes(part!.toLowerCase()))
  return [base, ...extras].filter(Boolean).join(', ')
}

const VIDEO_EXTENSIONS = /\.(mp4|mov|webm|m4v|ogv|ogg)(\?|#|$)/i

export function isVideoUrl(url?: string | null) {
  if (!url) return false
  return url.startsWith('data:video/') || VIDEO_EXTENSIONS.test(url)
}
