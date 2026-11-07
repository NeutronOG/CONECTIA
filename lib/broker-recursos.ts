// Módulo privado del broker. Los ids se guardan en BD: no cambiarlos.
export const CATEGORIAS_RECURSO = [
  { id: 'formato', titulo: 'Formatos bancarios' },
  { id: 'informacion', titulo: 'Información bancaria' },
  { id: 'tabulador', titulo: 'Tabuladores' },
] as const

export type CategoriaRecurso = typeof CATEGORIAS_RECURSO[number]['id']

export interface RecursoBroker {
  id: number
  categoria: CategoriaRecurso
  banco: string
  titulo: string
  descripcion: string
  liga: string
  archivo_nombre: string
  archivo_url: string | null
  vigente_hasta: string | null
}

// BBVA y Banamex prohíben mostrarse en iframe (X-Frame-Options / frame-ancestors): se abren en pestaña nueva.
export const SIMULADORES_OFICIALES = [
  { nombre: 'CONDUSEF', detalle: 'Comparador entre instituciones', url: 'https://phpapps.condusef.gob.mx/condusefhipotecario/index.php' },
  { nombre: 'BBVA', detalle: 'Simulador del banco', url: 'https://www.bbva.mx/personas/productos/creditos/credito-hipotecario/simulador-credito-hipotecario.html' },
  { nombre: 'Banamex', detalle: 'Simulador del banco', url: 'https://www.banamex.com/es/personas/creditos/credito-hipotecario/tabla-amortizacion.html' },
  { nombre: 'Santander', detalle: 'Simulador del banco', url: 'https://www.santander.com.mx/personas/creditos-hipotecarios/simulador-hipotecario.html' },
  { nombre: 'HSBC', detalle: 'Simulador del banco', url: 'https://hipoteca.hsbc.com.mx/' },
] as const
