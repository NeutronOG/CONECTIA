import { propiedades } from '../data/propiedades'
import * as fs from 'fs'
import * as path from 'path'

const headers = ['id', 'titulo', 'ubicacion', 'categoria', 'tipo', 'precioTexto', 'status']

const escapeCsv = (value: string) => {
  const escaped = value.replace(/"/g, '""')
  return `"${escaped}"`
}

const rows = propiedades.map((p) => [
  p.id,
  escapeCsv(p.titulo),
  escapeCsv(p.ubicacion),
  p.categoria,
  p.tipo,
  p.precioTexto,
  p.status,
])

const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

const outputPath = path.join(__dirname, '..', 'propiedades.csv')
fs.writeFileSync(outputPath, csv, 'utf8')

console.log(`Exportadas ${propiedades.length} propiedades a ${outputPath}`)
