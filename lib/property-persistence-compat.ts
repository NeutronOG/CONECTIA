import { isPropertyCategory, type PropertyCategory } from './property-categories'

const CATEGORY_MARKER_PREFIX = '__conectia_internal_category__:'
const BONUS_MARKER_PREFIX = '__conectia_internal_bonus__:'

type PropertyRecord = Record<string, any>

function characteristicsOf(record: PropertyRecord): string[] {
  return Array.isArray(record.caracteristicas)
    ? record.caracteristicas.filter((value): value is string => typeof value === 'string')
    : []
}

function decodeMarker(value: string, prefix: string) {
  if (!value.startsWith(prefix)) return null
  return value.slice(prefix.length)
}

function encodeMarker(prefix: string, value: string) {
  return `${prefix}${value}`
}

/** Quita metadatos internos antes de mostrar las características al usuario. */
export function publicCharacteristics(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => (
    typeof item === 'string'
    && !item.startsWith(CATEGORY_MARKER_PREFIX)
    && !item.startsWith(BONUS_MARKER_PREFIX)
  ))
}

/**
 * Elimina marcadores enviados por el cliente. La API vuelve a crearlos sólo
 * cuando la base histórica obliga a usar el modo de compatibilidad.
 */
export function sanitizePropertyPersistenceInput<T extends PropertyRecord>(record: T): T {
  if (!Object.prototype.hasOwnProperty.call(record, 'caracteristicas')) return { ...record }

  return {
    ...record,
    caracteristicas: publicCharacteristics(record.caracteristicas),
  }
}

export function effectivePropertyCategory(record: PropertyRecord): PropertyCategory {
  const marker = characteristicsOf(record)
    .map((value) => decodeMarker(value, CATEGORY_MARKER_PREFIX))
    .find((value): value is string => Boolean(value && isPropertyCategory(value)))

  if (marker && isPropertyCategory(marker)) return marker
  return isPropertyCategory(record.categoria) ? record.categoria : 'venta'
}

export function effectivePropertyBonus(record: PropertyRecord): string | undefined {
  const marker = characteristicsOf(record)
    .map((value) => decodeMarker(value, BONUS_MARKER_PREFIX))
    .find((value): value is string => value !== null)

  if (marker !== undefined) return marker || undefined
  if (record.bono === null || record.bono === undefined || record.bono === '') return undefined
  return String(record.bono)
}

/** Normaliza una fila histórica para que todas las lecturas vean los valores públicos. */
export function normalizePersistedProperty<T extends PropertyRecord>(record: T): T {
  return {
    ...record,
    categoria: effectivePropertyCategory(record),
    bono: effectivePropertyBonus(record),
    caracteristicas: publicCharacteristics(record.caracteristicas),
  }
}

/** Guarda la categoría solicitada sin perderla cuando el CHECK antiguo la rechaza. */
export function withLegacyCategoryFallback(
  record: PropertyRecord,
  requestedCategory: PropertyCategory,
) {
  const caracteristicas = characteristicsOf(record).filter(
    (value) => !value.startsWith(CATEGORY_MARKER_PREFIX),
  )

  return {
    ...record,
    categoria: 'venta',
    caracteristicas: [
      ...caracteristicas,
      encodeMarker(CATEGORY_MARKER_PREFIX, requestedCategory),
    ],
  }
}

/** Conserva el listón textual cuando una instalación antigua aún usa bono NUMERIC. */
export function withLegacyBonusFallback(record: PropertyRecord, requestedBonus: string) {
  const caracteristicas = characteristicsOf(record).filter(
    (value) => !value.startsWith(BONUS_MARKER_PREFIX),
  )

  return {
    ...record,
    bono: null,
    caracteristicas: [
      ...caracteristicas,
      encodeMarker(BONUS_MARKER_PREFIX, requestedBonus),
    ],
  }
}

export function isLegacyCategoryConstraintError(error: { code?: string; message?: string } | null) {
  return error?.code === '23514'
    && Boolean(error.message?.includes('propiedades_categoria_check'))
}

export function isLegacyNumericBonusError(
  error: { code?: string; message?: string } | null,
  requestedBonus: unknown,
) {
  return typeof requestedBonus === 'string'
    && requestedBonus.trim().length > 0
    && (error?.code === '22P02' || error?.code === '42804')
    && Boolean(error.message?.toLowerCase().includes('numeric'))
}
