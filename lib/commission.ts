import { Propiedad } from "@/data/propiedades"

/**
 * Devuelve el precio total de una propiedad.
 * Cuando la unidad de superficie es "Hectáreas", el precio guardado es por m²,
 * por lo que se multiplica por el área del terreno.
 */
export function getPrecioTotal(propiedad: Partial<Propiedad> | null | undefined): number {
  if (!propiedad) return 0
  const precio = Number(propiedad.precio) || 0
  const area = Number(propiedad.area) || 0
  if (propiedad.unidadSuperficie === "Hectáreas") {
    return precio * area
  }
  return precio
}

/**
 * Calcula la comisión que le corresponde al asesor.
 * El asesor recibe la mitad del porcentaje total elegido.
 */
export function getComisionAsesor(propiedad: Partial<Propiedad> | null | undefined): number {
  if (!propiedad) return 0
  const precioTotal = getPrecioTotal(propiedad)
  const pctTotal = Number(propiedad.comisionAsesorPct) || 4
  const pctAsesor = pctTotal / 2
  return Math.round(precioTotal * (pctAsesor / 100))
}

/**
 * Texto descriptivo de la comisión del asesor.
 */
export function getComisionAsesorTexto(propiedad: Partial<Propiedad> | null | undefined): string {
  if (!propiedad) return ""
  const pctTotal = Number(propiedad.comisionAsesorPct) || 4
  const pctAsesor = pctTotal / 2
  return `${pctAsesor}%`
}
