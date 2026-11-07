import { z } from 'zod'

// Etapa previa a la autorización del crédito. Se guarda completa en
// broker_clientes.pre_autorizacion (JSONB).
const fechaOVacio = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/)

export const previaSchema = z.object({
  observaciones: z.string().default(''),
  ingreso_titular: z.string().default(''),
  coacreditados: z.array(z.object({
    id: z.string(),
    nombre: z.string(),
    relacion: z.string(),
    ingreso_mensual: z.string(),
    fuente_ingreso: z.string(),
  })).default([]),
  faltantes: z.array(z.object({
    id: z.string(),
    documento: z.string(),
    solicitado: fechaOVacio,
    recibido: fechaOVacio,
  })).default([]),
  subsanaciones: z.array(z.object({
    id: z.string(),
    detalle: z.string(),
    fecha_limite: fechaOVacio,
    resuelta: fechaOVacio,
  })).default([]),
})

export type PreviaAutorizacion = z.infer<typeof previaSchema>
export type Coacreditado = PreviaAutorizacion['coacreditados'][number]
export type DocumentoFaltante = PreviaAutorizacion['faltantes'][number]
export type Subsanacion = PreviaAutorizacion['subsanaciones'][number]

export const PREVIA_VACIA: PreviaAutorizacion = { observaciones: '', ingreso_titular: '', coacreditados: [], faltantes: [], subsanaciones: [] }

// Los registros anteriores a esta etapa tienen `{}` en la columna
export const leerPrevia = (previa: Partial<PreviaAutorizacion> | null | undefined): PreviaAutorizacion => ({ ...PREVIA_VACIA, ...previa })

export const monto = (texto: string) => Number(texto.replace(/[^\d.]/g, '')) || 0
export const pesos = (valor: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(valor)

export const fechaHoy = () => new Date().toLocaleDateString('en-CA')

export function resumenPrevia(guardada: Partial<PreviaAutorizacion> | null | undefined) {
  const previa = leerPrevia(guardada)
  const faltantes = previa.faltantes.filter(f => !f.recibido).length
  const subsanaciones = previa.subsanaciones.filter(s => !s.resuelta).length
  const ingresoConjunto = previa.coacreditados.reduce((suma, c) => suma + monto(c.ingreso_mensual), monto(previa.ingreso_titular))
  const capturada = Boolean(previa.observaciones || previa.ingreso_titular) || previa.coacreditados.length + previa.faltantes.length + previa.subsanaciones.length > 0
  return { faltantes, subsanaciones, coacreditados: previa.coacreditados.length, pendientes: faltantes + subsanaciones, ingresoConjunto, capturada }
}
