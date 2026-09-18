import dotenv from 'dotenv'
import ExcelJS from 'exceljs'
import { createClient } from '@supabase/supabase-js'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'

dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Faltan credenciales de Supabase en .env.local')

const supabase = createClient(url, key, { auth: { persistSession: false } })
const outputArg = process.argv.slice(2).find(argument => argument !== '--')
const output = outputArg || path.join(process.cwd(), `propiedades-conectia-${new Date().toISOString().slice(0, 10)}.xlsx`)
const columns = [
  ['ID', 10], ['Título', 34], ['Ubicación', 34], ['Tipo', 24], ['Categoría', 16], ['Estado', 16],
  ['Precio', 18], ['Precio publicado', 20], ['Terreno', 14], ['Construcción', 16], ['Unidad', 12],
  ['Recámaras', 13], ['Baños', 10], ['Medios baños', 15], ['Cochera', 11], ['Amueblado', 18],
  ['Antigüedad', 18], ['Comisión total %', 18], ['Bono', 22], ['Fecha de publicación', 21],
  ['Fecha de apartado', 19], ['Término de contrato', 21], ['Asesor', 25], ['Email del asesor', 30],
  ['Teléfono del asesor', 20], ['Características', 45], ['Descripción', 60], ['Imagen principal', 45], ['Galería', 60],
]

function cleanPhotos(property) {
  return [...new Set([property.imagen || '', ...(property.galeria || [])]
    .map(value => String(value).trim().split(/[?#]/)[0].replace(/\/+$/, ''))
    .filter(value => value && !/placeholder|^data:/i.test(value)))]
}

function uniqueProperties(properties) {
  const ids = new Set()
  const photos = new Set()
  return properties.filter(property => {
    const id = String(property.id ?? '')
    const propertyPhotos = cleanPhotos(property)
    const duplicate = (id && ids.has(id)) || propertyPhotos.some(photo => photos.has(photo))
    if (id) ids.add(id)
    propertyPhotos.forEach(photo => photos.add(photo))
    return !duplicate
  })
}

function effectiveCategory(property) {
  const marker = (property.caracteristicas || []).find(value => String(value).startsWith('__conectia_internal_category__:'))
  return marker ? String(marker).slice('__conectia_internal_category__:'.length) : property.categoria || 'venta'
}

const [{ data: properties, error }, { data: users }] = await Promise.all([
  supabase.from('propiedades').select('*'),
  supabase.from('usuarios').select('id,email,nombre,telefono'),
])
if (error) throw error

const userMap = new Map()
for (const user of users || []) {
  userMap.set(String(user.id).toLowerCase(), user)
  if (user.email) userMap.set(String(user.email).toLowerCase(), user)
}

const sorted = uniqueProperties(properties || []).sort((a, b) => String(a.titulo || '').localeCompare(String(b.titulo || ''), 'es-MX', { sensitivity: 'base', numeric: true }))
const workbook = new ExcelJS.Workbook()
const worksheet = workbook.addWorksheet('Propiedades A-Z', { views: [{ state: 'frozen', ySplit: 4, activeCell: 'A5' }] })
workbook.creator = 'CONECTIA'
workbook.created = new Date()
worksheet.columns = columns.map(([, width]) => ({ width }))
worksheet.mergeCells(1, 1, 1, columns.length)
worksheet.getCell(1, 1).value = 'CONECTIA | Inventario de propiedades'
worksheet.mergeCells(2, 1, 2, columns.length)
worksheet.getCell(2, 1).value = `Total: ${sorted.length} propiedades · Ordenadas de la A a la Z · Generado: ${new Date().toLocaleString('es-MX')}`
worksheet.addRow([])
worksheet.addRow(columns.map(([title]) => title))

for (const property of sorted) {
  const ownerKey = String(property.asesor_email || property.usuario_id || '').toLowerCase()
  const advisor = userMap.get(ownerKey)
  const publicFeatures = (property.caracteristicas || []).filter(value => !String(value).startsWith('__conectia_internal_'))
  worksheet.addRow([
    property.id, property.titulo, property.ubicacion, property.tipo, effectiveCategory(property), property.status,
    Number(property.precio) || null, property.precio_texto, Number(property.area) || null,
    Number(property.area_construccion) || null, property.unidad_superficie || 'm²', property.habitaciones ?? null,
    property.banos ?? null, property.medios_banos ?? null, property.cochera ?? null,
    property.amueblado === 'no_aplica' ? 'No aplica' : String(property.amueblado || '').replaceAll('_', ' '),
    property.antiguedad || property.detalles?.antiguedad || '', property.comision_asesor_pct ? Number(property.comision_asesor_pct) / 100 : null,
    property.bono || '', property.created_at || property.fecha_publicacion || '', property.fecha_apartado || '',
    property.fecha_termino_contrato || '', advisor?.nombre || property.asesor_nombre || '',
    advisor?.email || property.asesor_email || property.usuario_id || '', advisor?.telefono || '',
    publicFeatures.join(', '), property.descripcion || '', property.imagen || '', (property.galeria || []).join('\n'),
  ])
}

worksheet.getRow(1).height = 34
worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 18 }
worksheet.getRow(1).alignment = { vertical: 'middle' }
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
worksheet.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4, column: columns.length } }
worksheet.getColumn(7).numFmt = '$#,##0.00'
worksheet.getColumn(18).numFmt = '0.00%'
for (let rowNumber = 5; rowNumber <= worksheet.rowCount; rowNumber += 1) {
  const row = worksheet.getRow(rowNumber)
  row.alignment = { vertical: 'top', wrapText: true }
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowNumber % 2 === 0 ? 'FFF6F2EE' : 'FFFFFFFF' } }
}

const buffer = await workbook.xlsx.writeBuffer()
await writeFile(output, Buffer.from(buffer))
console.log(`Exportadas ${sorted.length} propiedades a ${output}`)
