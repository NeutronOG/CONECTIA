export type BrokerPipeline = 'infonavit' | 'bancario'

// Gabriel lleva trámites Infonavit; Armando usa el pipeline bancario de Ara Brokers.
const PIPELINE_POR_BROKER: Record<string, BrokerPipeline> = { 'armando@conectia.mx': 'bancario' }

export const brokerPipeline = (email?: string | null): BrokerPipeline =>
  PIPELINE_POR_BROKER[email?.toLowerCase() ?? ''] ?? 'infonavit'

// Checklist del expediente de crédito hipotecario (hoja física que usan los brokers).
// Los ids se guardan en BD: no cambiarlos; para renombrar un documento cambia solo `nombre`.
export interface ChecklistGrupo {
  id: string
  titulo: string
  documentos: { id: string; nombre: string }[]
}

export const BROKER_CHECKLIST: ChecklistGrupo[] = [
  {
    id: 'credito',
    titulo: 'Crédito y comprador',
    documentos: [
      { id: 'constancia_credito', nombre: 'Constancia de crédito' },
      { id: 'check_list_infonavit', nombre: 'Check list Infonavit' },
      { id: 'precalificacion', nombre: 'Precalificación' },
      { id: 'solicitud_credito', nombre: 'Solicitud de crédito' },
      { id: 'acta_nacimiento_comprador', nombre: 'Acta de nacimiento comprador (original)' },
      { id: 'acta_matrimonio_comprador', nombre: 'Acta de matrimonio comprador (original)' },
      { id: 'ine_comprador', nombre: 'INE comprador / y esposa si es en conjunto' },
      { id: 'estado_cuenta_vendedor', nombre: 'Estado de cuenta bancario (vendedor)' },
      { id: 'avaluo', nombre: 'Avalúo' },
      { id: 'taller_saber_decidir', nombre: 'Taller Saber para Decidir' },
      { id: 'curp_rfc_comprador', nombre: 'CURP y constancia fiscal del RFC (comprador)' },
      { id: 'escrituras', nombre: 'Escrituras' },
      { id: 'formato_sic', nombre: 'Formato SIC' },
      { id: 'carta_saldos', nombre: 'Carta saldos / carta condicionada' },
      { id: 'certificado_gravamen', nombre: 'Certificado de gravamen' },
      { id: 'anexo_c', nombre: 'Anexo C' },
    ],
  },
  {
    id: 'vendedor',
    titulo: 'Vendedor',
    documentos: [
      { id: 'acta_nacimiento_vendedor', nombre: 'Acta de nacimiento vendedor' },
      { id: 'acta_matrimonio_vendedor', nombre: 'Acta de matrimonio vendedor' },
      { id: 'ine_vendedor', nombre: 'INE vendedor (y esposa si es sociedad conyugal)' },
      { id: 'rfc_curp_vendedor', nombre: 'Constancia de situación fiscal, RFC y CURP vendedor' },
      { id: 'isr_exencion', nombre: 'ISR para exención (luz) (INE)' },
      { id: 'recibo_luz', nombre: 'Recibo de luz (actual)' },
      { id: 'no_adeudo_agua', nombre: 'Carta no adeudo de agua (SAPAL)' },
      { id: 'predial_no_adeudo', nombre: 'Predial constancia no adeudo' },
      { id: 'fidoc_no_adeudo', nombre: 'FIDOC carta no adeudo de obras por cooperación' },
      { id: 'alineamiento', nombre: 'Alineamiento y número oficial' },
    ],
  },
  {
    id: 'cierre',
    titulo: 'Cierre',
    documentos: [
      { id: 'carta_manifiesto', nombre: 'Carta manifiesto' },
      { id: 'carta_patronal', nombre: 'Carta patronal' },
      { id: 'aviso_notificacion', nombre: 'Aviso de notificación, acuse de notificación, solicitud de crédito' },
      { id: 'cfe_comprador', nombre: 'Comprobante CFE comprador' },
    ],
  },
]

export const CHECKLIST_IDS = BROKER_CHECKLIST.flatMap(g => g.documentos.map(d => d.id))

/** id del documento → fecha (YYYY-MM-DD) en que se palomeó */
export type ChecklistEstado = Record<string, string>

export function checklistAvance(estado: ChecklistEstado | null | undefined) {
  const hechos = CHECKLIST_IDS.filter(id => estado?.[id]).length
  return { hechos, total: CHECKLIST_IDS.length, porcentaje: Math.round((hechos / CHECKLIST_IDS.length) * 100) }
}

export type EstadoEtapa = 'completado' | 'actual' | 'pendiente'

// Etapas del trámite de crédito Infonavit. Se guardan en el mismo JSON `checklist`
// con la llave `etapa_<id>` → fecha en que se marcó. No cambiar los ids.
export const ETAPAS_INFONAVIT = [
  { id: 'precalificacion', titulo: 'Precalificación', descripcion: 'Puntos y monto en Mi Cuenta Infonavit' },
  { id: 'taller', titulo: 'Taller', descripcion: 'Saber más para decidir mejor (constancia)' },
  { id: 'avaluo', titulo: 'Avalúo', descripcion: 'Perito valuador autorizado por Infonavit' },
  { id: 'expediente', titulo: 'Expediente', descripcion: 'Documentos del comprador y del vendedor' },
  { id: 'inscripcion', titulo: 'Inscripción', descripcion: 'Solicitud de inscripción de crédito y consulta SIC' },
  { id: 'patron', titulo: 'Confirmación patronal', descripcion: 'Aviso de retención y acuse del patrón' },
  { id: 'firma', titulo: 'Firma de escrituras', descripcion: 'Formalización ante notario' },
  { id: 'ejercido', titulo: 'Crédito ejercido', descripcion: 'Pago al vendedor y entrega de vivienda' },
] as const

// Etapas del pipeline bancario (Armando). Mismo mecanismo `etapa_<id>`; ids distintos a Infonavit.
export const ETAPAS_BANCARIO = [
  { id: 'autorizacion', titulo: 'Autorización', descripcion: 'Crédito autorizado por el banco' },
  { id: 'avaluo_bancario', titulo: 'Avalúo', descripcion: 'Avalúo del inmueble' },
  { id: 'notaria', titulo: 'Notaría', descripcion: 'Expediente en notaría' },
  { id: 'programacion_firma', titulo: 'Programación de firma', descripcion: 'Fecha de firma agendada' },
] as const

type DefinicionEtapa = { readonly id: string; readonly titulo: string; readonly descripcion: string }

// Columnas de la hoja de Armando: en qué bandeja está cada cliente.
export const ESTATUS_BANCARIO = [
  { id: 'pipeline', titulo: 'Pipeline' },
  { id: 'pendiente_formato', titulo: 'Pendiente formato' },
  { id: 'pendiente', titulo: 'Pendiente' },
] as const

export type EstatusBancario = typeof ESTATUS_BANCARIO[number]['id']

export const etapaKey = (id: string) => `etapa_${id}`

/** Llaves válidas en `checklist`: documentos de la hoja + etapas Infonavit y bancarias */
export const CHECKLIST_KEYS = [...CHECKLIST_IDS, ...[...ETAPAS_INFONAVIT, ...ETAPAS_BANCARIO].map(e => etapaKey(e.id))]

export interface Etapa {
  id: string
  titulo: string
  descripcion: string
  fecha?: string
  estado: EstadoEtapa
}

/** La etapa actual es la primera que no está marcada como hecha. */
export function etapasInfonavit(estado: ChecklistEstado | null | undefined, lista: readonly DefinicionEtapa[] = ETAPAS_INFONAVIT): Etapa[] {
  let actualAsignada = false
  return lista.map(etapa => {
    const fecha = estado?.[etapaKey(etapa.id)]
    const esActual = !fecha && !actualAsignada
    if (esActual) actualAsignada = true
    return { ...etapa, fecha, estado: fecha ? 'completado' : esActual ? 'actual' : 'pendiente' }
  })
}

export const etapasBancario = (estado: ChecklistEstado | null | undefined) => etapasInfonavit(estado, ETAPAS_BANCARIO)

/**
 * Avanza la línea de tiempo hasta `id` (marca esa etapa y las anteriores) o,
 * si ya estaba hecha, regresa a ella (desmarca esa etapa y las siguientes).
 */
export function moverEtapa(estado: ChecklistEstado, id: string, hoy: string, lista: readonly DefinicionEtapa[] = ETAPAS_INFONAVIT): ChecklistEstado {
  const siguiente = { ...estado }
  const indice = lista.findIndex(e => e.id === id)
  if (indice === -1) return siguiente
  if (siguiente[etapaKey(id)]) {
    lista.slice(indice).forEach(e => { delete siguiente[etapaKey(e.id)] })
  } else {
    lista.slice(0, indice + 1).forEach(e => { siguiente[etapaKey(e.id)] ??= hoy })
  }
  return siguiente
}
