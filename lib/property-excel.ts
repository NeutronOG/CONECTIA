import type { Propiedad } from '@/data/propiedades'

type PropertyForExcel = Propiedad & {
  antiguedad?: string
  asesorEmail?: string
  asesorNombre?: string
}

const COLUMNS = [
  { title: 'ID', width: 10 },
  { title: 'Título', width: 34 },
  { title: 'Ubicación', width: 34 },
  { title: 'Tipo', width: 24 },
  { title: 'Categoría', width: 16 },
  { title: 'Estado', width: 16 },
  { title: 'Precio', width: 18 },
  { title: 'Precio publicado', width: 20 },
  { title: 'Terreno', width: 14 },
  { title: 'Construcción', width: 16 },
  { title: 'Unidad', width: 12 },
  { title: 'Recámaras', width: 13 },
  { title: 'Baños', width: 10 },
  { title: 'Medios baños', width: 15 },
  { title: 'Cochera', width: 11 },
  { title: 'Amueblado', width: 18 },
  { title: 'Antigüedad', width: 18 },
  { title: 'Comisión total %', width: 18 },
  { title: 'Bono', width: 22 },
  { title: 'Fecha de publicación', width: 21 },
  { title: 'Fecha de apartado', width: 19 },
  { title: 'Término de contrato', width: 21 },
  { title: 'Asesor', width: 25 },
  { title: 'Email del asesor', width: 30 },
  { title: 'Teléfono del asesor', width: 20 },
  { title: 'Características', width: 45 },
  { title: 'Descripción', width: 60 },
  { title: 'Imagen principal', width: 45 },
  { title: 'Galería', width: 60 },
] as const

function text(value: unknown): string {
  return value === null || value === undefined ? '' : String(value)
}

function advisorName(property: PropertyForExcel): string {
  return property.agente?.nombre || property.asesorNombre || ''
}

function advisorEmail(property: PropertyForExcel): string {
  return property.agente?.email || property.asesorEmail || property.usuarioId || ''
}

function propertyRow(property: PropertyForExcel) {
  return [
    property.id,
    property.titulo,
    property.ubicacion,
    property.tipo,
    property.categoria,
    property.status,
    property.precio || null,
    property.precioTexto,
    property.area || null,
    property.areaConstruccion || null,
    property.unidadSuperficie || 'm²',
    property.habitaciones ?? null,
    property.banos ?? null,
    property.mediosBanos ?? null,
    property.cochera ?? null,
    property.amueblado === 'no_aplica' ? 'No aplica' : text(property.amueblado).replaceAll('_', ' '),
    property.detalles?.antiguedad || property.antiguedad || '',
    property.comisionAsesorPct ?? null,
    property.bono || '',
    property.fechaPublicacion || '',
    property.fechaApartado || '',
    property.fechaTerminoContrato || '',
    advisorName(property),
    advisorEmail(property),
    property.agente?.telefono || '',
    property.caracteristicas?.join(', ') || '',
    property.descripcion || '',
    property.imagen || '',
    property.galeria?.join('\n') || '',
  ]
}

export function sortPropertiesAlphabetically<T extends Pick<Propiedad, 'titulo'>>(properties: readonly T[]): T[] {
  return [...properties].sort((a, b) => a.titulo.localeCompare(b.titulo, 'es-MX', { sensitivity: 'base', numeric: true }))
}

export async function createPropertiesExcel(properties: readonly PropertyForExcel[]) {
  const { Workbook } = await import('exceljs')
  const workbook = new Workbook()
  const worksheet = workbook.addWorksheet('Propiedades A-Z', {
    views: [{ state: 'frozen', ySplit: 4, activeCell: 'A5' }],
    properties: { defaultRowHeight: 20 },
  })
  const sorted = sortPropertiesAlphabetically(properties)

  workbook.creator = 'CONECTIA'
  workbook.created = new Date()
  workbook.modified = new Date()
  worksheet.columns = COLUMNS.map(column => ({ width: column.width }))
  worksheet.mergeCells(1, 1, 1, COLUMNS.length)
  worksheet.getCell(1, 1).value = 'CONECTIA | Inventario de propiedades'
  worksheet.mergeCells(2, 1, 2, COLUMNS.length)
  worksheet.getCell(2, 1).value = `Total: ${sorted.length} propiedades · Ordenadas de la A a la Z · Generado: ${new Date().toLocaleString('es-MX')}`
  worksheet.addRow([])
  worksheet.addRow(COLUMNS.map(column => column.title))

  sorted.forEach(property => worksheet.addRow(propertyRow(property)))

  worksheet.getRow(1).height = 34
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 18 }
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'left' }
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF17313A' } }
  worksheet.getRow(2).height = 25
  worksheet.getRow(2).font = { color: { argb: 'FF526168' }, italic: true, size: 10 }
  worksheet.getRow(4).height = 30
  worksheet.getRow(4).eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FF17313A' }, size: 10 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7B29A' } }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cell.border = { bottom: { style: 'thin', color: { argb: 'FF17313A' } } }
  })

  worksheet.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4, column: COLUMNS.length } }
  worksheet.getColumn(7).numFmt = '$#,##0.00'
  worksheet.getColumn(18).numFmt = '0.00%'

  for (let rowNumber = 5; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber)
    row.alignment = { vertical: 'top', wrapText: true }
    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowNumber % 2 === 0 ? 'FFF6F2EE' : 'FFFFFFFF' } }
    row.getCell(18).value = typeof row.getCell(18).value === 'number' ? Number(row.getCell(18).value) / 100 : row.getCell(18).value
    const statusCell = row.getCell(6)
    const statusColors: Record<string, string> = { Disponible: 'FFE4F4ED', Exclusiva: 'FFFBEADF', Reservada: 'FFEEE9FA' }
    const statusColor = statusColors[text(statusCell.value)]
    if (statusColor) statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusColor } }
  }

  return workbook.xlsx.writeBuffer()
}

export async function downloadPropertiesExcel(properties: readonly PropertyForExcel[]) {
  const buffer = await createPropertiesExcel(properties)
  const blob = new Blob([buffer as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  anchor.href = url
  anchor.download = `propiedades-conectia-${date}.xlsx`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
