import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Faltan credenciales de Supabase en .env.local')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

const escapeCsv = (value: string) => {
  const escaped = String(value ?? '').replace(/"/g, '""')
  return `"${escaped}"`
}

async function main() {
  const { data, error } = await supabase
    .from('propiedades')
    .select('id, titulo, ubicacion, tipo, categoria, precio_texto, status, created_at')
    .order('id', { ascending: true })

  if (error) {
    throw error
  }

  const headers = ['id', 'titulo', 'ubicacion', 'tipo', 'categoria', 'precio_texto', 'status', 'created_at']

  const rows = (data || []).map((p: any) => [
    p.id,
    escapeCsv(p.titulo),
    escapeCsv(p.ubicacion),
    escapeCsv(p.tipo),
    escapeCsv(p.categoria),
    escapeCsv(p.precio_texto),
    escapeCsv(p.status),
    escapeCsv(p.created_at),
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const outputPath = path.join(process.cwd(), 'propiedades-supabase.csv')
  fs.writeFileSync(outputPath, csv, 'utf8')

  console.log(`Exportadas ${rows.length} propiedades de Supabase a ${outputPath}`)
}

main().catch((err) => {
  console.error('Error exportando propiedades:', err)
  process.exit(1)
})
