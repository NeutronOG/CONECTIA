const DAY = 86400000

function dateValue(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const time = Date.parse(`${value}T00:00:00Z`)
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : null
}

/** El calendario de apartado sólo aplica a renta; sin categoría se conserva la regla general. */
export function validateReservation(start: unknown, end: unknown, status?: unknown, categoria?: unknown): string | null {
  const requiresDates = status === 'Reservada' && (categoria === undefined || categoria === 'renta')
  if (!start && !end && !requiresDates) return null
  if (dateValue(start) === null || dateValue(end) === null) return 'Selecciona fechas válidas de apartado y término del contrato.'
  if (String(end) < String(start)) return 'El término del contrato no puede ser anterior al apartado.'
  return null
}

export function reservationNotice(end: string | undefined, now = new Date()): string | null {
  const time = dateValue(end)
  if (time === null) return null
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.round((time - today) / DAY)
  const date = new Date(time).toLocaleDateString('es-MX', { timeZone: 'UTC' })
  if (days < 0) return `Contrato vencido el ${date}`
  if (days === 0) return 'El contrato vence hoy'
  if (days <= 7) return `El contrato vence en ${days} día${days === 1 ? '' : 's'} (${date})`
  return null
}
